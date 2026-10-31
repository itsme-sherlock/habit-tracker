import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, type SupabaseDailyCompletion } from './_supabase';

interface CreateCompletionInput {
  date: string; // YYYY-MM-DD
  habitCompletions: Record<string, number>;
  taskCompletions: string[];
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
}

function toCompletion(s: SupabaseDailyCompletion) {
  return {
    date: s.date,
    habitCompletions: s.habit_completions,
    taskCompletions: s.task_completions,
    notes: s.notes ?? undefined,
    completedAt: s.completed_at,
    mood: s.mood ?? undefined,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseClient();
  const userId = req.headers['x-user-id'] as string || 'demo-user';

  try {
    switch (req.method) {
      case 'GET': {
        const date = req.query.date as string;

        let query = supabase
          .from('daily_completions')
          .select('*')
          .eq('user_id', userId);

        if (date) {
          query = query.eq('date', date);
        }

        query = query.order('date', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        return res.status(200).json(data.map(toCompletion));
      }

      case 'POST': {
        const input = req.body as CreateCompletionInput;
        const { data, error } = await supabase
          .from('daily_completions')
          .upsert({
            date: input.date,
            habit_completions: input.habitCompletions,
            task_completions: input.taskCompletions,
            notes: input.notes ?? null,
            completed_at: new Date().toISOString(),
            mood: input.mood ?? null,
            user_id: userId,
          }, { onConflict: 'date,user_id' })
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(toCompletion(data));
      }

      default:
        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    console.error('Completions API error:', err);
    return res.status(500).json({ error: err.message });
  }
}