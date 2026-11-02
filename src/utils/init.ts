// Initialization script to pre-populate GCP curriculum data on first run
import { addHabit, bulkAddStudyTasks, getSettings, saveSettings, getAll, deleteById, deleteStudyTask, getDB, put } from '../services/db';
import { isSupabaseConfigured } from '../services/supabase';
import { getCurriculumTasks, DEFAULT_HABITS, PLAN_VERSION, PLAN_START, PLAN_END } from '../data/gcpCurriculum';
import { PRODUCTION_CURRICULUM } from '../data/productionPlan';
import type { DailyCompletion, Habit, StudyTask } from '../types';

let running: Promise<void> | null = null;

// Single-flight so concurrent callers can't seed twice.
export function initializeApp(): Promise<void> {
  if (!running) {
    running = run().catch(err => {
      running = null;
      throw err;
    });
  }
  return running;
}

// Re-seeds when the store has no plan tasks (e.g. an earlier seed failed before the cloud tables were ready).
export async function ensurePlanSeeded(): Promise<void> {
  await initializeApp();
  const tasks = await getAll<StudyTask>('studyTasks');
  if (tasks.some(t => t.date >= PLAN_START && t.date <= PLAN_END)) return;
  running = null;
  await initializeApp();
}

async function run(): Promise<void> {
  // Repair data duplicated or corrupted by earlier double-seeding.
  const habits = await getAll<Habit>('habits');
  const seenHabits = new Set<string>();
  for (const h of habits) {
    const key = h.name?.trim().toLowerCase();
    if (!key || seenHabits.has(key)) {
      await deleteById('habits', h.id);
    } else {
      seenHabits.add(key);
    }
  }

  const settings = await getSettings();
  let tasks = await getAll<StudyTask>('studyTasks');

  // New plan version: drop old plan tasks that are not in the new plan, keeping matching ones (and their progress).
  const planKeys = new Set([...getCurriculumTasks(), ...PRODUCTION_CURRICULUM].map(t => `${t.date}|${t.title}`));
  if (settings.planVersion !== PLAN_VERSION) {
    for (const t of tasks.filter(t => t.date >= PLAN_START && t.date <= PLAN_END && !planKeys.has(`${t.date}|${t.title}`))) {
      await deleteStudyTask(t.id);
    }
    tasks = await getAll<StudyTask>('studyTasks');
  }

  const seenTasks = new Set<string>();
  for (const t of tasks) {
    const key = `${t.date}|${t.title}`;
    if (seenTasks.has(key)) {
      await deleteById('studyTasks', t.id);
    } else {
      seenTasks.add(key);
    }
  }

  // Seed the plan first and keep a habit failure from blocking it.
  const missing = [...getCurriculumTasks(), ...PRODUCTION_CURRICULUM].filter(t => !seenTasks.has(`${t.date}|${t.title}`));
  if (missing.length > 0) {
    await bulkAddStudyTasks(missing);
  }

  let habitError: unknown;
  for (const habit of DEFAULT_HABITS) {
    if (!seenHabits.has(habit.name.toLowerCase())) {
      try {
        await addHabit(habit);
      } catch (err) {
        habitError ??= err;
      }
    }
  }
  if (habitError) throw habitError;

  if (!settings.initialized || settings.planVersion !== PLAN_VERSION) {
    await saveSettings({ ...settings, initialized: true, planVersion: PLAN_VERSION });
  }

  await migrateLocalDataToCloud();
}

const MIGRATION_FLAG = 'habit-tracker-local-migrated-v1';

// One-time upload of progress saved in this browser before cloud-only storage.
async function migrateLocalDataToCloud(): Promise<void> {
  if (!isSupabaseConfigured() || localStorage.getItem(MIGRATION_FLAG)) return;

  const db = await getDB();
  const [localHabits, localTasks, localCompletions] = await Promise.all([
    db.getAll('habits'),
    db.getAll('studyTasks'),
    db.getAll('dailyCompletions'),
  ]);

  const remoteHabits = await getAll<Habit>('habits');
  const remoteTasks = await getAll<StudyTask>('studyTasks');
  const remoteCompletions = await getAll<DailyCompletion>('dailyCompletions');

  const habitIdMap = new Map<string, string>();
  for (const h of localHabits) {
    const match = remoteHabits.find(r => r.name.trim().toLowerCase() === h.name.trim().toLowerCase());
    if (match) {
      habitIdMap.set(h.id, match.id);
    } else {
      await put('habits', h);
      habitIdMap.set(h.id, h.id);
    }
  }

  const taskIdMap = new Map<string, string>();
  for (const t of localTasks) {
    const match = remoteTasks.find(r => r.date === t.date && r.title === t.title);
    if (match) {
      taskIdMap.set(t.id, match.id);
      if (t.completed && !match.completed) {
        await put('studyTasks', { ...match, completed: true, completedAt: t.completedAt ?? Date.now() });
      }
    } else {
      await put('studyTasks', t);
      taskIdMap.set(t.id, t.id);
    }
  }

  for (const c of localCompletions) {
    const mapped: DailyCompletion = {
      ...c,
      habitCompletions: Object.fromEntries(
        Object.entries(c.habitCompletions ?? {}).map(([id, n]) => [habitIdMap.get(id) ?? id, n]),
      ),
      taskCompletions: (c.taskCompletions ?? []).map(id => taskIdMap.get(id) ?? id),
    };
    const existing = remoteCompletions.find(r => r.date === c.date);
    if (existing) {
      const habitCompletions = { ...existing.habitCompletions };
      for (const [id, n] of Object.entries(mapped.habitCompletions)) {
        habitCompletions[id] = Math.max(habitCompletions[id] ?? 0, n);
      }
      await put('dailyCompletions', {
        ...existing,
        habitCompletions,
        taskCompletions: [...new Set([...existing.taskCompletions, ...mapped.taskCompletions])],
        notes: existing.notes ?? mapped.notes,
        mood: existing.mood ?? mapped.mood,
      });
    } else {
      await put('dailyCompletions', mapped);
    }
  }

  localStorage.setItem(MIGRATION_FLAG, '1');
}