/** Supabase-only storage for habits, tasks and completions (single shared owner, no login). */
import type { DailyCompletion, Habit, StudyTask } from '../types';
import {
  getSupabaseClient,
  toPWACompletion,
  toPWAHabit,
  toPWATask,
  toSupabaseCompletion,
  toSupabaseHabit,
  toSupabaseTask,
  type SupabaseDailyCompletion,
  type SupabaseHabit,
  type SupabaseStudyTask,
} from './supabase';

export const SHARED_OWNER_ID = '00000000-0000-0000-0000-000000000001';

export type RemoteStore = 'habits' | 'studyTasks' | 'dailyCompletions';

const TABLES: Record<RemoteStore, string> = {
  habits: 'habits',
  studyTasks: 'study_tasks',
  dailyCompletions: 'daily_completions',
};

const SORT: Record<RemoteStore, string> = {
  habits: 'order',
  studyTasks: 'id',
  dailyCompletions: 'date',
};

export function isRemoteStore(name: string): name is RemoteStore {
  return name in TABLES;
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

async function fetchRows<T>(store: RemoteStore): Promise<T[]> {
  const client = getSupabaseClient();
  const pageSize = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from(TABLES[store])
      .select('*')
      .eq('user_id', SHARED_OWNER_ID)
      .order(SORT[store], { ascending: true })
      .range(from, from + pageSize - 1);
    fail(error);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < pageSize) return rows;
  }
}

export async function remoteGetAll(store: RemoteStore): Promise<unknown[]> {
  if (store === 'habits') return (await fetchRows<SupabaseHabit>(store)).map(toPWAHabit);
  if (store === 'studyTasks') return (await fetchRows<SupabaseStudyTask>(store)).map(toPWATask);
  return (await fetchRows<SupabaseDailyCompletion>(store)).map(toPWACompletion);
}

export async function remoteGetById(store: RemoteStore, id: string): Promise<unknown | undefined> {
  const client = getSupabaseClient();
  const column = store === 'dailyCompletions' ? 'date' : 'id';
  const { data, error } = await client
    .from(TABLES[store])
    .select('*')
    .eq('user_id', SHARED_OWNER_ID)
    .eq(column, id)
    .maybeSingle();
  fail(error);
  if (!data) return undefined;
  if (store === 'habits') return toPWAHabit(data as SupabaseHabit);
  if (store === 'studyTasks') return toPWATask(data as SupabaseStudyTask);
  return toPWACompletion(data as SupabaseDailyCompletion);
}

export async function remoteGetTasksByDate(date: string): Promise<StudyTask[]> {
  const { data, error } = await getSupabaseClient()
    .from('study_tasks')
    .select('*')
    .eq('user_id', SHARED_OWNER_ID)
    .eq('date', date);
  fail(error);
  return ((data ?? []) as SupabaseStudyTask[]).map(toPWATask);
}

function rowFor(store: RemoteStore, value: unknown): Record<string, unknown> {
  const now = new Date().toISOString();
  if (store === 'habits') {
    const habit = value as Habit;
    return {
      id: habit.id,
      ...toSupabaseHabit(habit, SHARED_OWNER_ID),
      created_at: new Date(habit.createdAt).toISOString(),
      updated_at: now,
    };
  }
  if (store === 'studyTasks') {
    const task = value as StudyTask;
    return { id: task.id, ...toSupabaseTask(task, SHARED_OWNER_ID), updated_at: now };
  }
  return { ...toSupabaseCompletion(value as DailyCompletion, SHARED_OWNER_ID), updated_at: now };
}

export async function remotePutMany(store: RemoteStore, values: unknown[]): Promise<void> {
  if (values.length === 0) return;
  const client = getSupabaseClient();
  const onConflict = store === 'dailyCompletions' ? 'date,user_id' : 'id';
  const chunk = 200;
  for (let i = 0; i < values.length; i += chunk) {
    const rows = values.slice(i, i + chunk).map(value => rowFor(store, value));
    const { error } = await client.from(TABLES[store]).upsert(rows, { onConflict });
    fail(error);
  }
}

export async function remoteDelete(store: RemoteStore, id: string): Promise<void> {
  const column = store === 'dailyCompletions' ? 'date' : 'id';
  const { error } = await getSupabaseClient()
    .from(TABLES[store])
    .delete()
    .eq('user_id', SHARED_OWNER_ID)
    .eq(column, id);
  fail(error);
}

export async function remoteClearAll(): Promise<void> {
  const client = getSupabaseClient();
  for (const table of Object.values(TABLES)) {
    const { error } = await client.from(table).delete().eq('user_id', SHARED_OWNER_ID);
    fail(error);
  }
}

// Stable UUID from text so every device seeding the same plan task writes the same row.
export function deterministicUuid(text: string): string {
  const parts: number[] = [];
  for (let seed = 0; seed < 4; seed++) {
    let h = 0x811c9dc5 ^ (seed * 0x9e3779b1);
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    parts.push(h >>> 0);
  }
  const hex = parts.map(p => p.toString(16).padStart(8, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
