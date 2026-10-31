/** Sync engine for Habit Tracker PWA - handles offline-first sync with Supabase. */
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  getSupabaseClient,
  toPWAHabit,
  toPWATask,
  toPWACompletion,
  toSupabaseHabit,
  toSupabaseTask,
  toSupabaseCompletion,
  type SupabaseHabit,
  type SupabaseStudyTask,
  type SupabaseDailyCompletion,
} from './supabase';
import type { Habit, StudyTask, DailyCompletion } from '../types';

// Sync queue item types
export type SyncOperationType = 'create' | 'update' | 'delete';
export type SyncEntityType = 'habits' | 'tasks' | 'completions';

export interface SyncQueueItem {
  id?: number;
  entityType: SyncEntityType;
  operation: SyncOperationType;
  entityId: string;
  data?: any; // The entity data for create/update
  timestamp: number;
  retries: number;
  lastError?: string;
}

// Sync status
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingCount: number;
  failedCount: number;
  error: string | null;
}

// IndexedDB schema for sync queue
interface SyncDBSchema extends DBSchema {
  syncQueue: {
    key: number;
    value: SyncQueueItem;
    indexes: { 'by-entity': [SyncEntityType, string]; 'by-timestamp': number };
  };
  syncMeta: {
    key: string;
    value: { key: string; value: any };
  };
}

let syncDB: IDBPDatabase<SyncDBSchema> | null = null;
let syncStatusListeners: ((status: SyncStatus) => void)[] = [];
let currentStatus: SyncStatus = {
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncTime: null,
  pendingCount: 0,
  failedCount: 0,
  error: null,
};

// Initialize sync database
async function getSyncDB(): Promise<IDBPDatabase<SyncDBSchema>> {
  if (!syncDB) {
    syncDB = await openDB<SyncDBSchema>('habit-tracker-sync', 1, {
      upgrade(db) {
        const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('by-entity', ['entityType', 'entityId']);
        queueStore.createIndex('by-timestamp', 'timestamp');
        db.createObjectStore('syncMeta');
      },
    });
  }
  return syncDB;
}

// Notify status listeners
function notifyStatusChange() {
  syncStatusListeners.forEach(cb => cb({ ...currentStatus }));
}

export function subscribeToSyncStatus(listener: (status: SyncStatus) => void): () => void {
  syncStatusListeners.push(listener);
  listener({ ...currentStatus });
  return () => {
    const idx = syncStatusListeners.indexOf(listener);
    if (idx >= 0) syncStatusListeners.splice(idx, 1);
  };
}

export function getSyncStatus(): SyncStatus {
  return { ...currentStatus };
}

async function updateStatus(partial: Partial<SyncStatus>) {
  currentStatus = { ...currentStatus, ...partial };
  notifyStatusChange();
}

// Queue management
export async function enqueueSync(
  entityType: SyncEntityType,
  operation: SyncOperationType,
  entityId: string,
  data?: any
): Promise<void> {
  const db = await getSyncDB();
  await db.add('syncQueue', {
    entityType,
    operation,
    entityId,
    data,
    timestamp: Date.now(),
    retries: 0,
  });
  await updatePendingCount();
}

async function updatePendingCount(): Promise<void> {
  const db = await getSyncDB();
  const count = await db.count('syncQueue');
  const failed = await db.countFromIndex('syncQueue', 'by-timestamp', IDBKeyRange.lowerBound(Date.now() - 86400000)); // rough
  // Actually count failed items (retries > 3)
  const all = await db.getAll('syncQueue');
  const failedCount = all.filter(item => item.retries >= 3).length;
  await updateStatus({ pendingCount: count, failedCount });
}

// Get user ID from Supabase auth
async function getUserId(): Promise<string | null> {
  const client = getSupabaseClient();
  const { data: { user } } = await client.auth.getUser();
  return user?.id ?? null;
}

// Push local changes to Supabase
async function pushChanges(userId: string): Promise<void> {
  const db = await getSyncDB();
  const queue = await db.getAllFromIndex('syncQueue', 'by-timestamp');

  for (const item of queue) {
    if (item.retries >= 3) continue; // Skip permanently failed

    try {
      const client = getSupabaseClient();

      switch (item.entityType) {
        case 'habits': {
          if (item.operation === 'create' || item.operation === 'update') {
            const habitData = toSupabaseHabit(item.data, userId);
            if (item.operation === 'create') {
              await client.from('habits').insert(habitData);
            } else {
              await client.from('habits').update(habitData).eq('id', item.entityId).eq('user_id', userId);
            }
          } else if (item.operation === 'delete') {
            await client.from('habits').delete().eq('id', item.entityId).eq('user_id', userId);
          }
          break;
        }
        case 'tasks': {
          if (item.operation === 'create' || item.operation === 'update') {
            const taskData = toSupabaseTask(item.data, userId);
            if (item.operation === 'create') {
              await client.from('study_tasks').insert(taskData);
            } else {
              await client.from('study_tasks').update(taskData).eq('id', item.entityId).eq('user_id', userId);
            }
          } else if (item.operation === 'delete') {
            await client.from('study_tasks').delete().eq('id', item.entityId).eq('user_id', userId);
          }
          break;
        }
        case 'completions': {
          const completionData = toSupabaseCompletion(item.data, userId);
          await client.from('daily_completions').upsert(completionData);
          break;
        }
      }

      // Remove from queue on success
      await db.delete('syncQueue', item.id!);
    } catch (error) {
      // Increment retry count
      await db.put('syncQueue', {
        ...item,
        retries: item.retries + 1,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error(`Sync failed for ${item.entityType}/${item.entityId}:`, error);
    }
  }
}

// Pull changes from Supabase
async function pullChanges(userId: string): Promise<void> {
  const client = getSupabaseClient();
  const db = await getSyncDB();

  // Get last sync time
  const meta = await db.get('syncMeta', 'lastSync');
  const lastSync = meta?.value ?? 0;

  // Pull habits updated since last sync
  const { data: habits, error: habitsError } = await client
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', new Date(lastSync).toISOString());

  if (habitsError) throw habitsError;

  // Pull tasks updated since last sync
  const { data: tasks, error: tasksError } = await client
    .from('study_tasks')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', new Date(lastSync).toISOString());

  if (tasksError) throw tasksError;

  // Pull completions updated since last sync
  const { data: completions, error: completionsError } = await client
    .from('daily_completions')
    .select('*')
    .eq('user_id', userId)
    .gt('completed_at', new Date(lastSync).toISOString());

  if (completionsError) throw completionsError;

  // Merge with local IndexedDB (import from db.ts)
  const { default: localDB } = await import('./db');

  // Merge habits
  if (habits) {
    for (const h of habits) {
      const pwaHabit = toPWAHabit(h);
      await localDB.putHabit(pwaHabit);
    }
  }

  // Merge tasks
  if (tasks) {
    for (const t of tasks) {
      const pwaTask = toPWATask(t);
      await localDB.putTask(pwaTask);
    }
  }

  // Merge completions
  if (completions) {
    for (const c of completions) {
      const pwaCompletion = toPWACompletion(c);
      await localDB.putCompletion(pwaCompletion);
    }
  }

  // Update last sync time
  await db.put('syncMeta', { key: 'lastSync', value: Date.now() });
}

// Main sync function
export async function sync(): Promise<void> {
  if (currentStatus.isSyncing) return;
  if (!currentStatus.isOnline) {
    await updateStatus({ error: 'Offline - sync skipped' });
    return;
  }

  const userId = await getUserId();
  if (!userId) {
    await updateStatus({ error: 'Not authenticated' });
    return;
  }

  await updateStatus({ isSyncing: true, error: null });

  try {
    await pushChanges(userId);
    await pullChanges(userId);
    await updateStatus({ lastSyncTime: Date.now(), isSyncing: false });
  } catch (error) {
    await updateStatus({
      isSyncing: false,
      error: error instanceof Error ? error.message : 'Sync failed',
    });
  }

  await updatePendingCount();
}

// Auto-sync setup
let syncInterval: ReturnType<typeof setInterval> | null = null;
let onlineHandler: (() => void) | null = null;
let offlineHandler: (() => void) | null = null;

export function startAutoSync(intervalMs = 5 * 60 * 1000): void {
  // Periodic sync
  syncInterval = setInterval(() => {
    if (currentStatus.isOnline && !currentStatus.isSyncing) {
      sync();
    }
  }, intervalMs);

  // Sync on online
  onlineHandler = () => {
    updateStatus({ isOnline: true });
    sync();
  };
  window.addEventListener('online', onlineHandler);

  // Track offline
  offlineHandler = () => {
    updateStatus({ isOnline: false });
  };
  window.addEventListener('offline', offlineHandler);

  // Initial sync
  if (currentStatus.isOnline) {
    sync();
  }
}

export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  if (onlineHandler) {
    window.removeEventListener('online', onlineHandler);
    onlineHandler = null;
  }
  if (offlineHandler) {
    window.removeEventListener('offline', offlineHandler);
    offlineHandler = null;
  }
}

// Manual sync trigger
export async function manualSync(): Promise<void> {
  await sync();
}

// Conflict resolution: last-write-wins based on updated_at
export async function resolveConflicts(): Promise<void> {
  // This would compare local vs remote updated_at timestamps
  // and keep the newer version. For now, pullChanges overwrites local.
  // A more sophisticated implementation would show conflicts to user.
  await sync();
}