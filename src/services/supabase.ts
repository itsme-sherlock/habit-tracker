import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SUPABASE_CONFIG, isConfigured } from '../config/supabaseConfig';
import { DailyCompletion, StudyNoteRecord, StudyTask } from '../types';

class SupabaseServiceClass {
  private client: SupabaseClient | null = null;
  private currentUrl: string = '';
  private currentKey: string = '';

  constructor() {
    this.initClient();
  }

  /**
   * Initialize or update Supabase client
   */
  public initClient(url?: string, key?: string) {
    const targetUrl = url || DEFAULT_SUPABASE_CONFIG.url;
    const targetKey = key || DEFAULT_SUPABASE_CONFIG.anonKey;

    if (isConfigured(targetUrl, targetKey)) {
      this.currentUrl = targetUrl;
      this.currentKey = targetKey;
      this.client = createClient(targetUrl, targetKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
    } else {
      this.client = null;
    }
  }

  public isReady(): boolean {
    return this.client !== null;
  }

  /**
   * Test connection to Supabase
   */
  public async testConnection(url: string, key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const tempClient = createClient(url, key, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      });

      // Quick query on study_notes or health check
      const { error } = await tempClient.from('study_notes').select('date').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet, but credentials could still be valid
        if (
          error.message.includes('relation "study_notes" does not exist') ||
          error.code === 'PGRST205'
        ) {
          return { success: true, error: 'Connected to Supabase! Now run supabase_schema.sql in the SQL Editor.' };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Connection failed' };
    }
  }

  /**
   * Sync or save daily completion to Supabase
   */
  public async saveCompletion(completion: DailyCompletion): Promise<boolean> {
    if (!this.client) return false;
    try {
      const { error } = await this.client.from('daily_completions').upsert(
        {
          date: completion.date,
          habit_completions: completion.habitCompletions || {},
          task_completions: completion.taskCompletions || [],
          subtask_completions: completion.subtaskCompletions || {},
          notes: completion.notes || '',
          mood: completion.mood || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'date' }
      );
      if (error) {
        console.warn('Supabase saveCompletion error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveCompletion failed:', e);
      return false;
    }
  }

  /**
   * Fetch all remote daily completions
   */
  public async fetchCompletions(): Promise<Record<string, DailyCompletion> | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.from('daily_completions').select('*');
      if (error || !data) return null;

      const map: Record<string, DailyCompletion> = {};
      data.forEach((row: any) => {
        map[row.date] = {
          date: row.date,
          habitCompletions: row.habit_completions || {},
          taskCompletions: row.task_completions || [],
          subtaskCompletions: row.subtask_completions || {},
          notes: row.notes || '',
          mood: row.mood || undefined,
          completedAt: new Date(row.updated_at).getTime() || Date.now(),
        };
      });
      return map;
    } catch (e) {
      console.warn('Supabase fetchCompletions failed:', e);
      return null;
    }
  }

  /**
   * Fetch study note for a given date
   */
  public async fetchStudyNotes(date: string): Promise<StudyNoteRecord | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('study_notes')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (error || !data) return null;

      return {
        date: data.date,
        topic: data.topic,
        summary: data.summary,
        keyConcepts: data.key_concepts || [],
        failureModes: data.failure_modes || [],
        metricsScale: data.metrics_scale || [],
        interviewQA: data.interview_qa || [],
        codeSnippet: data.code_snippet,
        rawMarkdown: data.raw_markdown,
        updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : undefined,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Save or push study notes (from IDE or App)
   */
  public async saveStudyNotes(record: StudyNoteRecord): Promise<boolean> {
    if (!this.client) return false;
    try {
      const { error } = await this.client.from('study_notes').upsert(
        {
          date: record.date,
          topic: record.topic,
          summary: record.summary,
          key_concepts: record.keyConcepts || [],
          failure_modes: record.failureModes || [],
          metrics_scale: record.metricsScale || [],
          interview_qa: record.interviewQA || [],
          code_snippet: record.codeSnippet || null,
          raw_markdown: record.rawMarkdown || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'date' }
      );
      if (error) {
        console.warn('Supabase saveStudyNotes error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveStudyNotes failed:', e);
      return false;
    }
  }
}

export const SupabaseService = new SupabaseServiceClass();
