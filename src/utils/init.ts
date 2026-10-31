// Initialization script to pre-populate GCP curriculum data on first run
import { addHabit, bulkAddStudyTasks, getSettings, saveSettings, getAll, deleteById, deleteStudyTask } from '../services/db';
import { getCurriculumTasks, DEFAULT_HABITS, PLAN_VERSION, PLAN_START, PLAN_END } from '../data/gcpCurriculum';
import { PRODUCTION_CURRICULUM } from '../data/productionPlan';
import type { Habit, StudyTask } from '../types';

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

  // New plan version: replace the previous plan's tasks (those inside the plan window).
  if (settings.planVersion !== PLAN_VERSION) {
    for (const t of tasks.filter(t => t.date >= PLAN_START && t.date <= PLAN_END)) {
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

  for (const habit of DEFAULT_HABITS) {
    if (!seenHabits.has(habit.name.toLowerCase())) {
      await addHabit(habit);
    }
  }

  const missing = [...getCurriculumTasks(), ...PRODUCTION_CURRICULUM].filter(t => !seenTasks.has(`${t.date}|${t.title}`));
  if (missing.length > 0) {
    await bulkAddStudyTasks(missing);
  }

  if (!settings.initialized || settings.planVersion !== PLAN_VERSION) {
    await saveSettings({ ...settings, initialized: true, planVersion: PLAN_VERSION });
  }
}