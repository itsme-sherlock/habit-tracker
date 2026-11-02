/** Shared-storage sync lifecycle: no login, every device uses the same Supabase rows. */
import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../services/supabase';
import { SHARED_OWNER_ID } from '../services/remoteStore';
import {
  manualSync,
  startAutoSync,
  stopAutoSync,
  subscribeToSyncStatus,
  getSyncStatus,
  type SyncStatus,
} from '../services/sync';

const SHARED_USER = { id: SHARED_OWNER_ID, email: 'Shared cloud storage (no login)' };

export function useSupabaseSync() {
  const configured = isSupabaseConfigured();
  const [authError, setAuthError] = useState<string | null>(() =>
    configured ? null : 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cloud storage.',
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());

  useEffect(() => subscribeToSyncStatus(setSyncStatus), []);

  useEffect(() => {
    if (!configured) return;
    startAutoSync(2_000); // Faster sync: 2 seconds instead of 10
    return stopAutoSync;
  }, [configured]);

  const noop = useCallback(async () => {}, []);
  const triggerSync = useCallback(async () => {
    await manualSync();
  }, []);

  return {
    user: configured ? SHARED_USER : null,
    isLoadingAuth: false,
    authError,
    setAuthError,
    configured,
    signIn: noop,
    signUp: noop,
    signOut: noop,
    syncStatus,
    triggerSync,
    isSyncing: syncStatus.isSyncing,
  };
}

export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus());
  useEffect(() => subscribeToSyncStatus(setStatus), []);
  return status;
}
