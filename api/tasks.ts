import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, type SupabaseStudyTask, verifySupabaseToken, extractTokenFromHeader } from './_supabase';

interface CreateTaskInput {
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  durationMinutes: number;
  category: 'study' | 'practice' | 'review' | 'mock-exam';
}

interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  completed?: boolean;
}

function toTask(s: SupabaseStudyTask) {
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

function toSupabaseTask(t: CreateTaskInput, userId: string) {
  return {
    date: t.date,
    title: t.title,
    description: t.description ?? null,
    duration_minutes: t.durationMinutes,
    category: t.category,
    completed: false,
    user_id: userId,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseClient();

  // Verify Supabase JWT from Authorization header
  const token = extractTokenFromHeader(req.headers.authorization as string | undefined);
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header with Bearer token' });
  }

  const userId = await verifySupabaseToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const date = req.query.date as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        let query = supabase.from('study_tasks').select('*').eq('user_id', userId);

        if (date) {
          query = query.eq('date', date);
        } else if (startDate && endDate) {
          query = query.gte('date', startDate).lte('date', endDate);
        }

        query = query.order('date', { ascending: true });

        const { data, error } = await query;
        if (error) throw error;
        return res.status(200).json(data.map(toTask));
      }

      case 'POST': {
        const input = req.body as CreateTaskInput;
        const { data, error } = await supabase
          .from('study_tasks')
          .insert(toSupabaseTask(input, userId))
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(toTask(data));
      }

      case 'PUT': {
        const input = req.body as UpdateTaskInput;
        const { id, completed, ...updates } = input;

        const supabaseUpdates: Partial<SupabaseStudyTask> = {};
        if (updates.title !== undefined) supabaseUpdates.title = updates.title;
        if (updates.description !== undefined) supabaseUpdates.description = updates.description ?? null;
        if (updates.durationMinutes !== undefined) supabaseUpdates.duration_minutes = updates.durationMinutes;
        if (updates.category !== undefined) supabaseUpdates.category = updates.category;
        if (completed !== undefined) {
          supabaseUpdates.completed = completed;
          supabaseUpdates.completed_at = completed ? new Date().toISOString() : null;
        }
        supabaseUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('study_tasks')
          .update(supabaseUpdates)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(toTask(data));
      }

      case 'DELETE': {
        const id = req.query.id as string;
        const { error } = await supabase
          .from('study_tasks')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
        return res.status(204).send('');
      }

      default:
        res.setHeader('Allow', 'GET, POST, PUT, DELETE');
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    console.error('Tasks API error:', err);
    return res.status(500).json({ error: err.message });
  }
}