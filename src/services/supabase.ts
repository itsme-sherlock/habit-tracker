/** Supabase client and sync utilities for Habit Tracker PWA. */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Habit, StudyTask, DailyCompletion } from '../types';

// Types matching database schema
export interface SupabaseHabit {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  target_count: number;
  unit: string;
  created_at: string;
  order: number;
  updated_at: string | null;
  user_id: string;
}

export interface SupabaseStudyTask {
  id: string;
  date: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  category: 'study' | 'practice' | 'review' | 'mock-exam';
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
  user_id: string;
}

export interface SupabaseDailyCompletion {
  date: string;
  habit_completions: Record<string, number>;
  task_completions: string[];
  notes: string | null;
  completed_at: string;
  mood: number | null;
  user_id: string;
}

// Supabase client singleton
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }

    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false, // We'll handle auth differently for PWA
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
}

export function resetSupabaseClient(): void {
  supabaseClient = null;
}

// Convert Supabase types to PWA types
export function toPWAHabit(s: SupabaseHabit): Habit {
  return {
    id: s.id,
    name: s.name,
    description: s.description ?? undefined,
    frequency: s.frequency as Habit['frequency'],
    targetCount: s.target_count,
    unit: s.unit as Habit['unit'],
    createdAt: s.created_at,
    order: s.order,
    updatedAt: s.updated_at ?? undefined,
  };
}

export function toPWATask(s: SupabaseStudyTask): StudyTask {
  return {
    id: s.id,
    date: s.date,
    title: s.title,
    description: s.description ?? undefined,
    durationMinutes: s.duration_minutes,
    category: s.category,
    completed: s.completed,
    completedAt: s.completed_at ?? undefined,
    createdAt: s.created_at,
    updatedAt: s.updated_at ?? undefined,
  };
}

export function toPWACompletion(s: SupabaseDailyCompletion): DailyCompletion {
  return {
    date: s.date,
    habitCompletions: s.habit_completions,
    taskCompletions: s.task_completions,
    notes: s.notes ?? undefined,
    mood: s.mood ?? undefined,
    completedAt: s.completed_at,
  };
}

// Convert PWA types to Supabase types
export function toSupabaseHabit(h: Habit, userId: string): Omit<SupabaseHabit, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: h.name,
    description: h.description ?? null,
    frequency: h.frequency,
    target_count: h.targetCount,
    unit: h.unit,
    order: h.order,
    user_id: userId,
  };
}

export function toSupabaseTask(t: StudyTask, userId: string): Omit<SupabaseStudyTask, 'id' | 'created_at' | 'updated_at'> {
  return {
    date: t.date,
    title: t.title,
    description: t.description ?? null,
    duration_minutes: t.durationMinutes,
    category: t.category,
    completed: t.completed,
    completed_at: t.completedAt ?? null,
    user_id: userId,
  };
}

export function toSupabaseCompletion(c: DailyCompletion, userId: string): Omit<SupabaseDailyCompletion, 'user_id'> {
  return {
    date: c.date,
    habit_completions: c.habitCompletions,
    task_completions: c.taskCompletions,
    notes: c.notes ?? null,
    completed_at: c.completedAt,
    mood: c.mood ?? null,
  };
}

// Auth helpers for PWA (using Supabase Auth with email/password or magic link)
export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithMagicLink(email: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithOtp({ email });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const client = getSupabaseClient();
  const { data: { user } } = await client.auth.getUser();
  return user;
}

export async function getCurrentSession() {
  const client = getSupabaseClient();
  const { data: { session } } = await client.auth.getSession();
  return session;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const client = getSupabaseClient();
  return client.auth.onAuthStateChange(callback);
}