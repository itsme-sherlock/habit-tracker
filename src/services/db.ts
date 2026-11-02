import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Habit, StudyTask, DailyCompletion, AppSettings, NotificationSettings } from '../types';
import { isSupabaseConfigured } from './supabase';
import {
  deterministicUuid,
  isRemoteStore,
  remoteClearAll,
  remoteDelete,
  remoteGetAll,
  remoteGetById,
  remoteGetTasksByDate,
  remotePutMany,
} from './remoteStore';

interface HabitTrackerDB extends DBSchema {
  habits: {
    key: string;
    value: Habit;
    indexes: { 'by-order': number; 'by-created': number };
  };
  studyTasks: {
    key: string;
    value: StudyTask;
    indexes: { 'by-date': string; 'by-category': string };
  };
  dailyCompletions: {
    key: string;
    value: DailyCompletion;
    indexes: { 'by-date': string; 'by-completed': number };
  };
  settings: {
    key: string;
    value: AppSettings | NotificationSettings;
  };
  pushSubscription: {
    key: string;
    value: PushSubscription;
  };
}

const DB_NAME = 'habit-tracker-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<HabitTrackerDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<HabitTrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<HabitTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Habits store
        const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
        habitStore.createIndex('by-order', 'order');
        habitStore.createIndex('by-created', 'createdAt');

        // Study tasks store
        const taskStore = db.createObjectStore('studyTasks', { keyPath: 'id' });
        taskStore.createIndex('by-date', 'date');
        taskStore.createIndex('by-category', 'category');

        // Daily completions store
        const completionStore = db.createObjectStore('dailyCompletions', { keyPath: 'date' });
        completionStore.createIndex('by-completed', 'completedAt');

        // Settings store
        db.createObjectStore('settings', { keyPath: 'id' });

        // Push subscription store
        db.createObjectStore('pushSubscription', { keyPath: 'endpoint' });
      },
    });
  }
  return dbPromise;
}

// Generic CRUD helpers
// Habits, tasks and completions live only in Supabase when it is configured.
function useRemote(storeName: string): storeName is 'habits' | 'studyTasks' | 'dailyCompletions' {
  return isSupabaseConfigured() && isRemoteStore(storeName);
}

export async function getAll<T>(storeName: keyof HabitTrackerDB): Promise<T[]> {
  if (useRemote(storeName)) return (await remoteGetAll(storeName)) as T[];
  const db = await getDB();
  return db.getAll(storeName as any);
}

export async function getById<T>(storeName: keyof HabitTrackerDB, id: string): Promise<T | undefined> {
  if (useRemote(storeName)) return (await remoteGetById(storeName, id)) as T | undefined;
  const db = await getDB();
  return db.get(storeName as any, id);
}

export async function put<T>(storeName: keyof HabitTrackerDB, value: T): Promise<string> {
  if (useRemote(storeName)) {
    await remotePutMany(storeName, [value]);
    return String((value as { id?: string; date?: string }).id ?? (value as { date?: string }).date ?? '');
  }
  const db = await getDB();
  return db.put(storeName as any, value as any);
}

export async function deleteById(storeName: keyof HabitTrackerDB, id: string): Promise<void> {
  if (useRemote(storeName)) return remoteDelete(storeName, id);
  const db = await getDB();
  return db.delete(storeName as any, id);
}

export async function getByIndex<T>(
  storeName: keyof HabitTrackerDB,
  indexName: string,
  value: string | number
): Promise<T[]> {
  if (storeName === 'studyTasks' && indexName === 'by-date' && isSupabaseConfigured()) {
    return (await remoteGetTasksByDate(String(value))) as T[];
  }
  const db = await getDB();
  return db.getAllFromIndex(storeName as any, indexName, value);
}

// Specific helpers for habits
export async function getHabits(): Promise<Habit[]> {
  const habits = await getAll<Habit>('habits');
  return habits.sort((a, b) => a.order - b.order);
}

export async function addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'order'>): Promise<Habit> {
  const habits = await getHabits();
  const newHabit: Habit = {
    ...habit,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    order: habits.length,
  };
  await put('habits', newHabit);
  return newHabit;
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
  const habit = await getById<Habit>('habits', id);
  if (habit) {
    const updated = { ...habit, ...updates };
    await put('habits', updated);
  }
}

export async function deleteHabit(id: string): Promise<void> {
  await deleteById('habits', id);
  // Reorder remaining habits
  const habits = await getHabits();
  for (let i = 0; i < habits.length; i++) {
    if (habits[i].order !== i) {
      await updateHabit(habits[i].id, { order: i });
    }
  }
}

export async function reorderHabits(habitIds: string[]): Promise<void> {
  for (let i = 0; i < habitIds.length; i++) {
    await updateHabit(habitIds[i], { order: i });
  }
}

// Specific helpers for study tasks
export async function getTasksForDate(date: string): Promise<StudyTask[]> {
  return getByIndex<StudyTask>('studyTasks', 'by-date', date);
}

export async function getTasksForDateRange(startDate: string, endDate: string): Promise<StudyTask[]> {
  const allTasks = await getAll<StudyTask>('studyTasks');
  return allTasks.filter(task => task.date >= startDate && task.date <= endDate);
}

export async function addStudyTask(task: Omit<StudyTask, 'id'>): Promise<StudyTask> {
  const newTask: StudyTask = {
    ...task,
    id: crypto.randomUUID(),
  };
  await put('studyTasks', newTask);
  return newTask;
}

export async function updateStudyTask(id: string, updates: Partial<StudyTask>): Promise<void> {
  const task = await getById<StudyTask>('studyTasks', id);
  if (task) {
    const updated = { ...task, ...updates };
    await put('studyTasks', updated);
  }
}

export async function deleteStudyTask(id: string): Promise<void> {
  await deleteById('studyTasks', id);
}

export async function bulkAddStudyTasks(tasks: Omit<StudyTask, 'id'>[]): Promise<StudyTask[]> {
  // Deterministic ids make seeding idempotent when several devices start at once.
  const results: StudyTask[] = tasks.map(task => ({
    ...task,
    id: isSupabaseConfigured() ? deterministicUuid(`${task.date}|${task.title}`) : crypto.randomUUID(),
  }));
  if (isSupabaseConfigured()) {
    await remotePutMany('studyTasks', results);
    return results;
  }
  const db = await getDB();
  const tx = db.transaction('studyTasks', 'readwrite');
  for (const task of results) await tx.store.put(task);
  await tx.done;
  return results;
}
// Specific helpers for daily completions
export async function getCompletionForDate(date: string): Promise<DailyCompletion | undefined> {
  return getById<DailyCompletion>('dailyCompletions', date);
}

export async function saveDailyCompletion(completion: DailyCompletion): Promise<void> {
  await put('dailyCompletions', completion);
}

export async function getCompletionsForRange(startDate: string, endDate: string): Promise<DailyCompletion[]> {
  const all = await getAll<DailyCompletion>('dailyCompletions');
  return all.filter(c => c.date >= startDate && c.date <= endDate);
}

// Settings helpers
export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'app');
  return settings || { theme: 'system', notificationSettings: { pushEnabled: true, emailEnabled: true, pushTime: '08:00', emailTime: '08:00' } };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', { id: 'app', ...settings });
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const settings = await getSettings();
  return settings.notificationSettings;
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  const current = await getSettings();
  await saveSettings({ ...current, notificationSettings: settings });
}

// Push subscription helpers
export async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  const db = await getDB();
  await db.put('pushSubscription', subscription);
}

export async function getPushSubscription(): Promise<PushSubscription | undefined> {
  const db = await getDB();
  const all = await db.getAll('pushSubscription');
  return all[0];
}

export async function deletePushSubscription(): Promise<void> {
  const db = await getDB();
  const sub = await getPushSubscription();
  if (sub) {
    await db.delete('pushSubscription', sub.endpoint);
  }
}

// Export/Import all data
export async function exportAllData(): Promise<string> {
  const [habits, tasks, completions, settings] = await Promise.all([
    getAll<Habit>('habits'),
    getAll<StudyTask>('studyTasks'),
    getAll<DailyCompletion>('dailyCompletions'),
    getSettings(),
  ]);
  return JSON.stringify({ habits, tasks, completions, settings, exportedAt: Date.now() }, null, 2);
}

export async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);
  if (data.habits) for (const habit of data.habits) await put('habits', habit);
  if (data.tasks) for (const task of data.tasks) await put('studyTasks', task);
  if (data.completions) for (const completion of data.completions) await put('dailyCompletions', completion);
  if (data.settings) await saveSettings(data.settings);
}

// Clear all data
export async function clearAllData(): Promise<void> {
  if (isSupabaseConfigured()) await remoteClearAll();
  const db = await getDB();
  const tx = db.transaction(['habits', 'studyTasks', 'dailyCompletions', 'settings', 'pushSubscription'], 'readwrite');
  await Promise.all([
    tx.objectStore('habits').clear(),
    tx.objectStore('studyTasks').clear(),
    tx.objectStore('dailyCompletions').clear(),
    tx.objectStore('settings').clear(),
    tx.objectStore('pushSubscription').clear(),
  ]);
  await tx.done;
}