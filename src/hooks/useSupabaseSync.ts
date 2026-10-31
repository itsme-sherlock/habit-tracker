/** Authentication and sync lifecycle for the Supabase-backed account. */
import { useCallback, useEffect, useState } from 'react';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
} from '../services/supabase';
import {
  manualSync,
  startAutoSync,
  stopAutoSync,
  subscribeToSyncStatus,
  getSyncStatus,
  type SyncStatus,
} from '../services/sync';

interface AccountUser {
  id: string;
  email: string;
}

export function useSupabaseSync() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(() => isSupabaseConfigured());
  const [authError, setAuthError] = useState<string | null>(() =>
    isSupabaseConfigured() ? null : 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable account sync.',
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());
  const configured = isSupabaseConfigured();

  useEffect(() => subscribeToSyncStatus(setSyncStatus), []);

  useEffect(() => {
    if (!configured) {
      return;
    }

    let active = true;
    let unsubscribe = () => {};
    void Promise.resolve()
      .then(() => {
        if (!active) return null;
        const client = getSupabaseClient();
        const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
          if (!active) return;
          setUser(session?.user ? { id: session.user.id, email: session.user.email ?? '' } : null);
          setAuthError(null);
          setIsLoadingAuth(false);
        });
        unsubscribe = () => subscription.unsubscribe();
        return client.auth.getSession();
      })
      .then(result => {
        if (!result || !active) return;
        if (result.error) throw result.error;
        const sessionUser = result.data.session?.user;
        setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? '' } : null);
        setIsLoadingAuth(false);
      })
      .catch(error => {
        if (!active) return;
        setAuthError(error instanceof Error ? error.message : 'Could not restore your sign-in session.');
        setIsLoadingAuth(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [configured]);

  useEffect(() => {
    if (user) startAutoSync();
    else stopAutoSync();
    return stopAutoSync;
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    await signInWithEmail(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    await signUpWithEmail(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await supabaseSignOut();
    setUser(null);
  }, []);

  const triggerSync = useCallback(async () => {
    await manualSync();
  }, []);

  return {
    user,
    isLoadingAuth,
    authError,
    setAuthError,
    configured,
    signIn,
    signUp,
    signOut,
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
