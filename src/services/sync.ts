/** Sync status for the Supabase-only store: all devices read and write the same rows. */
import { getSupabaseClient } from './supabase';
import { SHARED_OWNER_ID } from './remoteStore';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingCount: number;
  failedCount: number;
  error: string | null;
}

const listeners: Array<(status: SyncStatus) => void> = [];
let currentStatus: SyncStatus = {
  isOnline: typeof navigator === 'undefined' || navigator.onLine,
  isSyncing: false,
  lastSyncTime: null,
  pendingCount: 0,
  failedCount: 0,
  error: null,
};

function updateStatus(partial: Partial<SyncStatus>): void {
  currentStatus = { ...currentStatus, ...partial };
  for (const listener of listeners) listener({ ...currentStatus });
}

export function subscribeToSyncStatus(listener: (status: SyncStatus) => void): () => void {
  listeners.push(listener);
  listener({ ...currentStatus });
  return () => {
    const index = listeners.indexOf(listener);
    if (index >= 0) listeners.splice(index, 1);
  };
}

export function getSyncStatus(): SyncStatus {
  return { ...currentStatus };
}

// Verifies the connection; a new lastSyncTime tells the UI to reload data from Supabase.
async function refresh(): Promise<void> {
  if (!currentStatus.isOnline) {
    updateStatus({ error: 'Offline. Changes need a connection to save.' });
    return;
  }
  if (currentStatus.isSyncing) return;
  updateStatus({ isSyncing: true });
  try {
    const { error } = await getSupabaseClient()
      .from('study_tasks')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', SHARED_OWNER_ID);
    if (error) throw new Error(error.message);
    updateStatus({ isSyncing: false, lastSyncTime: Date.now(), error: null });
  } catch (error) {
    updateStatus({ isSyncing: false, error: error instanceof Error ? error.message : 'Could not reach Supabase.' });
  }
}

let syncInterval: ReturnType<typeof setInterval> | null = null;
let onlineHandler: (() => void) | null = null;
let offlineHandler: (() => void) | null = null;
let visibilityHandler: (() => void) | null = null;

export function startAutoSync(intervalMs = 10_000): void {
  if (syncInterval) return;
  syncInterval = setInterval(() => {
    if (!document.hidden) void refresh();
  }, intervalMs);
  onlineHandler = () => {
    updateStatus({ isOnline: true });
    void refresh();
  };
  offlineHandler = () => updateStatus({ isOnline: false, error: 'Offline. Changes need a connection to save.' });
  visibilityHandler = () => {
    if (!document.hidden) void refresh();
  };
  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);
  document.addEventListener('visibilitychange', visibilityHandler);
  void refresh();
}

export function stopAutoSync(): void {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = null;
  if (onlineHandler) window.removeEventListener('online', onlineHandler);
  if (offlineHandler) window.removeEventListener('offline', offlineHandler);
  if (visibilityHandler) document.removeEventListener('visibilitychange', visibilityHandler);
  onlineHandler = offlineHandler = visibilityHandler = null;
}

export async function manualSync(): Promise<void> {
  await refresh();
}
