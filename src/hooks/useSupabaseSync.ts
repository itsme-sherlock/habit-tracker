/** React hook for Supabase sync integration in Habit Tracker PWA. */
import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient, signInWithEmail, signUpWithEmail, signInWithMagicLink, signOut, getCurrentUser, onAuthStateChange } from '../services/supabase';
import { startAutoSync, stopAutoSync, sync, manualSync, subscribeToSyncStatus, getSyncStatus, type SyncStatus } from '../services/sync';
import type { Habit, StudyTask, DailyCompletion } from '../types';

interface UseSupabaseSyncReturn {
  // Auth
  user: { id: string; email: string } | null;
  isLoadingAuth: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;

  // Sync
  syncStatus: SyncStatus;
  triggerSync: () => Promise<void>;
  isSyncing: boolean;

  // Data operations (queue for sync)
  queueHabitCreate: (habit: Habit) => Promise<void>;
  queueHabitUpdate: (habit: Habit) => Promise<void>;
  queueHabitDelete: (habitId: string) => Promise<void>;
  queueTaskCreate: (task: StudyTask) => Promise<void>;
  queueTaskUpdate: (task: StudyTask) => Promise<void>;
  queueTaskDelete: (taskId: string) => Promise<void>;
  queueCompletion: (completion: DailyCompletion) => Promise<void>;
}

export function useSupabaseSync(): UseSupabaseSyncReturn {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());

  // Subscribe to sync status
  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus(setSyncStatus);
    return unsubscribe;
  }, []);

  // Auth state listener
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const currentUser = await getCurrentUser();
      if (mounted) {
        setUser(currentUser ? { id: currentUser.id, email: currentUser.email ?? '' } : null);
        setIsLoadingAuth(false);
      }
    };

    initAuth();

    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ? { id: session.user.id, email: session.user.email ?? '' } : null);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auto-sync lifecycle
  useEffect(() => {
    if (user) {
      startAutoSync();
    } else {
      stopAutoSync();
    }
    return () => stopAutoSync();
  }, [user]);

  // Auth actions
  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await signUpWithEmail(email, password);
  }, []);

  const signInMagicLink = useCallback(async (email: string) => {
    await signInWithMagicLink(email);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  // Data operations - queue for sync
  const queueHabitCreate = useCallback(async (habit: Habit) => {
    await import('../services/sync').then(m => m.enqueueSync('habits', 'create', habit.id, habit));
  }, []);

  const queueHabitUpdate = useCallback(async (habit: Habit) => {
    await import('../services/sync').then(m => m.enqueueSync('habits', 'update', habit.id, habit));
  }, []);

  const queueHabitDelete = useCallback(async (habitId: string) => {
    await import('../services/sync').then(m => m.enqueueSync('habits', 'delete', habitId));
  }, []);

  const queueTaskCreate = useCallback(async (task: StudyTask) => {
    await import('../services/sync').then(m => m.enqueueSync('tasks', 'create', task.id, task));
  }, []);

  const queueTaskUpdate = useCallback(async (task: StudyTask) => {
    await import('../services/sync').then(m => m.enqueueSync('tasks', 'update', task.id, task));
  }, []);

  const queueTaskDelete = useCallback(async (taskId: string) => {
    await import('../services/sync').then(m => m.enqueueSync('tasks', 'delete', taskId));
  }, []);

  const queueCompletion = useCallback(async (completion: DailyCompletion) => {
    await import('../services/sync').then(m => m.enqueueSync('completions', 'update', completion.date, completion));
  }, []);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    await manualSync();
  }, []);

  return {
    user,
    isLoadingAuth,
    signIn,
    signUp,
    signInMagicLink,
    signOut: handleSignOut,
    syncStatus,
    triggerSync,
    isSyncing: syncStatus.isSyncing,
    queueHabitCreate,
    queueHabitUpdate,
    queueHabitDelete,
    queueTaskCreate,
    queueTaskUpdate,
    queueTaskDelete,
    queueCompletion,
  };
}

// Helper hook for components that need sync status
export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus());

  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus(setStatus);
    return unsubscribe;
  }, []);

  return status;
}