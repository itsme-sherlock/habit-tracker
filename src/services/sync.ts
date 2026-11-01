/** Offline-first synchronization of local IndexedDB data with Supabase. */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
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
import { deleteById, put } from './db';

// Shared user ID for no-auth sync mode (all devices use same ID)
const SHARED_USER_ID = 'shared-device';

export type SyncOperationType = 'create' | 'update' | 'delete';
export type SyncEntityType = 'habits' | 'tasks' | 'completions';

export interface SyncQueueItem {
  id?: number;
  entityType: SyncEntityType;
  operation: SyncOperationType;
  entityId: string;
  data?: Habit | StudyTask | DailyCompletion;
  timestamp: number;
  retries: number;
  lastError?: string;
  userId?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingCount: number;
  failedCount: number;
  error: string | null;
}

interface SyncDBSchema extends DBSchema {
  syncQueue: {
    key: number;
    value: SyncQueueItem;
    indexes: { 'by-entity': [SyncEntityType, string]; 'by-timestamp': number };
  };
  syncMeta: {
    key: string;
    value: { key: string; value: number };
  };
}

interface SyncDeletion {
  entity_type: SyncEntityType;
  entity_id: string;
  deleted_at: string;
  user_id: string;
}

interface RemoteData {
  habits: SupabaseHabit[];
  tasks: SupabaseStudyTask[];
  completions: SupabaseDailyCompletion[];
  deletions: SyncDeletion[];
}

let syncDB: IDBPDatabase<SyncDBSchema> | null = null;
const syncStatusListeners: Array<(status: SyncStatus) => void> = [];
let currentStatus: SyncStatus = {
  isOnline: typeof navigator === 'undefined' || navigator.onLine,
  isSyncing: false,
  lastSyncTime: null,
  pendingCount: 0,
  failedCount: 0,
  error: null,
};

async function getSyncDB(): Promise<IDBPDatabase<SyncDBSchema>> {
  if (!syncDB) {
    syncDB = await openDB<SyncDBSchema>('habit-tracker-sync', 1, {
      upgrade(db) {
        const queue = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        queue.createIndex('by-entity', ['entityType', 'entityId']);
        queue.createIndex('by-timestamp', 'timestamp');
        db.createObjectStore('syncMeta');
      },
    });
  }
  return syncDB;
}

function updateStatus(partial: Partial<SyncStatus>): void {
  currentStatus = { ...currentStatus, ...partial };
  for (const listener of syncStatusListeners) listener({ ...currentStatus });
}

export function subscribeToSyncStatus(listener: (status: SyncStatus) => void): () => void {
  syncStatusListeners.push(listener);
  listener({ ...currentStatus });
  return () => {
    const index = syncStatusListeners.indexOf(listener);
    if (index >= 0) syncStatusListeners.splice(index, 1);
  };
}

export function getSyncStatus(): SyncStatus {
  return { ...currentStatus };
}

async function updatePendingCount(): Promise<void> {
  const db = await getSyncDB();
  const queue = await db.getAll('syncQueue');
  updateStatus({
    pendingCount: queue.length,
    failedCount: queue.filter(item => item.retries > 0).length,
  });
}

export async function enqueueSync(
  entityType: SyncEntityType,
  operation: SyncOperationType,
  entityId: string,
  data?: Habit | StudyTask | DailyCompletion,
): Promise<void> {
  const db = await getSyncDB();
  const existing = await db.getAllFromIndex('syncQueue', 'by-entity', [entityType, entityId]);
  const tx = db.transaction('syncQueue', 'readwrite');
  for (const item of existing) {
    if (item.id !== undefined) await tx.store.delete(item.id);
  }
  await tx.store.add({
    entityType,
    operation,
    entityId,
    data,
    timestamp: Date.now(),
    retries: 0,
    userId: SHARED_USER_ID,
  });
  await tx.done;
  await updatePendingCount();
  if (syncInterval && currentStatus.isOnline) void sync();
}

async function fetchAll<T>(table: string, userId: string, updatedSince?: string, updatedColumn = 'updated_at'): Promise<T[]> {
  const client = getSupabaseClient();
  const rows: T[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    let request = client
      .from(table)
      .select('*')
      .eq('user_id', userId);
    if (updatedSince) request = request.gt(updatedColumn, updatedSince);
    const sortColumn = table === 'daily_completions'
      ? 'date'
      : table === 'sync_deletions'
        ? 'entity_id'
        : 'id';
    request = request.order(sortColumn, { ascending: true });
    if (table === 'sync_deletions') request = request.order('entity_type', { ascending: true });
    const { data, error } = await request.range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data as T[]));
    if (data.length < pageSize) return rows;
  }
}

async function fetchRemoteData(userId: string, updatedSince?: string): Promise<RemoteData> {
  const [habits, tasks, completions, deletions] = await Promise.all([
    fetchAll<SupabaseHabit>('habits', userId, updatedSince),
    fetchAll<SupabaseStudyTask>('study_tasks', userId, updatedSince),
    fetchAll<SupabaseDailyCompletion>('daily_completions', userId, updatedSince),
    fetchAll<SyncDeletion>('sync_deletions', userId),
  ]);
  return { habits, tasks, completions, deletions };
}

function sameSeedHabit(local: Habit, remote: SupabaseHabit): boolean {
  return local.name.trim().toLocaleLowerCase() === remote.name.trim().toLocaleLowerCase();
}

function sameSeedTask(local: StudyTask, remote: SupabaseStudyTask): boolean {
  return local.date === remote.date
    && local.title.trim().toLocaleLowerCase() === remote.title.trim().toLocaleLowerCase();
}

async function pushChanges(userId: string, remote: RemoteData): Promise<string | null> {
  const db = await getSyncDB();
  const queue = await db.getAllFromIndex('syncQueue', 'by-timestamp');
  const client = getSupabaseClient();
  let firstError: string | null = null;

  for (const original of queue) {
    if (original.userId && original.userId !== userId) continue;
    const item = original.userId ? original : { ...original, userId };
    if (!original.userId) await db.put('syncQueue', item);

    try {
      if (item.operation === 'delete') {
        const { error } = await client.from('sync_deletions').upsert({
          entity_type: item.entityType,
          entity_id: item.entityId,
          user_id: userId,
          deleted_at: new Date(item.timestamp).toISOString(),
        }, { onConflict: 'user_id,entity_type,entity_id' });
        if (error) throw error;

        const table = item.entityType === 'habits' ? 'habits' : item.entityType === 'tasks' ? 'study_tasks' : 'daily_completions';
        const query = client.from(table).delete().eq('user_id', userId);
        const result = item.entityType === 'completions'
          ? await query.eq('date', item.entityId)
          : await query.eq('id', item.entityId);
        if (result.error) throw result.error;
      } else {
        const { error } = await client.from('sync_deletions')
          .delete()
          .eq('user_id', userId)
          .eq('entity_type', item.entityType)
          .eq('entity_id', item.entityId);
        if (error) throw error;
      }

      if (item.operation !== 'delete' && item.entityType === 'habits' && item.data) {
        const habit = item.data as Habit;
        const equivalent = remote.habits.find(row => row.id !== item.entityId && sameSeedHabit(habit, row));
        if (equivalent) {
          await deleteById('habits', item.entityId);
        } else {
          const { error } = await client.from('habits').upsert({
            id: item.entityId,
            ...toSupabaseHabit(habit, userId),
          }, { onConflict: 'id' });
          if (error) throw error;
          remote.habits.push({ ...toSupabaseHabit(habit, userId), id: item.entityId, created_at: new Date(habit.createdAt).toISOString(), updated_at: new Date().toISOString() });
        }
      } else if (item.operation !== 'delete' && item.entityType === 'tasks' && item.data) {
        const task = item.data as StudyTask;
        const equivalent = remote.tasks.find(row => row.id !== item.entityId && sameSeedTask(task, row));
        if (equivalent) {
          await deleteById('studyTasks', item.entityId);
        } else {
          const { error } = await client.from('study_tasks').upsert({
            id: item.entityId,
            ...toSupabaseTask(task, userId),
          }, { onConflict: 'id' });
          if (error) throw error;
          remote.tasks.push({ ...toSupabaseTask(task, userId), id: item.entityId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        }
      } else if (item.operation !== 'delete' && item.entityType === 'completions' && item.data) {
        const completion = item.data as DailyCompletion;
        const { error } = await client.from('daily_completions').upsert(
          toSupabaseCompletion(completion, userId),
          { onConflict: 'date,user_id' },
        );
        if (error) throw error;
      }

      if (item.id !== undefined) await db.delete('syncQueue', item.id);
    } catch (error) {
      firstError ??= error instanceof Error ? error.message : 'Unknown sync error';
      await db.put('syncQueue', {
        ...item,
        retries: item.retries + 1,
        lastError: error instanceof Error ? error.message : 'Unknown sync error',
      });
      console.error(`Sync failed for ${item.entityType}/${item.entityId}:`, error);
    }
  }
  return firstError;
}

async function mergeRemoteData(userId: string, remote: RemoteData): Promise<void> {
  const deleted = new Set(remote.deletions.map(item => `${item.entity_type}:${item.entity_id}`));
  const db = await getSyncDB();
  const pending = await db.getAll('syncQueue');
  const pendingKeys = new Set(
    pending.filter(item => !item.userId || item.userId === userId)
      .map(item => `${item.entityType}:${item.entityId}`),
  );

  for (const item of remote.deletions) {
    if (item.entity_type === 'habits') await deleteById('habits', item.entity_id);
    if (item.entity_type === 'tasks') await deleteById('studyTasks', item.entity_id);
    if (item.entity_type === 'completions') await deleteById('dailyCompletions', item.entity_id);
  }

  for (const row of remote.habits) {
    const key = `habits:${row.id}`;
    if (!deleted.has(key) && !pendingKeys.has(key)) await put('habits', toPWAHabit(row));
  }
  for (const row of remote.tasks) {
    const key = `tasks:${row.id}`;
    if (!deleted.has(key) && !pendingKeys.has(key)) await put('studyTasks', toPWATask(row));
  }
  for (const row of remote.completions) {
    const key = `completions:${row.date}`;
    if (!deleted.has(key) && !pendingKeys.has(key)) await put('dailyCompletions', toPWACompletion(row));
  }
}

export async function sync(): Promise<void> {
  if (currentStatus.isSyncing) return;
  if (!currentStatus.isOnline) {
    updateStatus({ error: 'Offline. Changes will sync when you reconnect.' });
    return;
  }

  updateStatus({ isSyncing: true, error: null });
  try {
    const client = getSupabaseClient();
    // No auth required - use shared ID
    const userId = SHARED_USER_ID;

    const localSyncDB = await getSyncDB();
    const pending = await localSyncDB.getAll('syncQueue');
    const hasPendingCreate = pending.some(item => item.operation === 'create' && (!item.userId || item.userId === userId));
    const metaKey = `lastSync:${userId}`;
    const meta = await localSyncDB.get('syncMeta', metaKey);
    const since = meta && !hasPendingCreate
      ? new Date(Math.max(0, meta.value - 60_000)).toISOString()
      : undefined;
    const remote = await fetchRemoteData(userId, since);
    const pushError = await pushChanges(userId, remote);
    const updatedRemote = await fetchRemoteData(userId, since);
    await mergeRemoteData(userId, updatedRemote);
    await localSyncDB.put('syncMeta', { key: metaKey, value: Date.now() });
    updateStatus({
      isSyncing: false,
      lastSyncTime: Date.now(),
      error: pushError ? `Some changes could not sync: ${pushError}` : null,
    });
  } catch (error) {
    updateStatus({
      isSyncing: false,
      error: error instanceof Error ? error.message : 'Sync failed.',
    });
  } finally {
    await updatePendingCount();
  }
}

let syncInterval: ReturnType<typeof setInterval> | null = null;
let onlineHandler: (() => void) | null = null;
let offlineHandler: (() => void) | null = null;

export function startAutoSync(intervalMs = 5 * 60_000): void {
  if (syncInterval) return;
  syncInterval = setInterval(() => {
    if (currentStatus.isOnline && !currentStatus.isSyncing) void sync();
  }, intervalMs);
  onlineHandler = () => {
    updateStatus({ isOnline: true });
    void sync();
  };
  offlineHandler = () => updateStatus({ isOnline: false, error: 'Offline. Changes will sync when you reconnect.' });
  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);
  if (currentStatus.isOnline) void sync();
}

export function stopAutoSync(): void {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = null;
  if (onlineHandler) window.removeEventListener('online', onlineHandler);
  if (offlineHandler) window.removeEventListener('offline', offlineHandler);
  onlineHandler = null;
  offlineHandler = null;
}

export async function manualSync(): Promise<void> {
  await sync();
}

export async function resolveConflicts(): Promise<void> {
  await sync();
}
