import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase credentials not configured');
    }

    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

/**
 * Verify Supabase JWT token and return user ID
 * Returns null if token is invalid or expired
 */
export async function verifySupabaseToken(token: string): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }
    return user.id;
  } catch {
    return null;
  }
}

/**
 * Extract user ID from Authorization header
 * Expected format: "Bearer <supabase-access-token>"
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

// Types matching your database schema
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