import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient, type SupabaseHabit } from './_supabase';

interface CreateHabitInput {
  name: string;
  description?: string;
  targetCount: number;
  unit: string;
  frequency?: 'daily';
}

interface UpdateHabitInput extends Partial<CreateHabitInput> {
  id: string;
}

function toHabit(s: SupabaseHabit) {
  return {
    id: s.id,
    name: s.name,
    description: s.description ?? undefined,
    frequency: s.frequency as 'daily',
    targetCount: s.target_count,
    unit: s.unit,
    createdAt: s.created_at,
    order: s.order,
    updatedAt: s.updated_at ?? undefined,
  };
}

function toSupabaseHabit(h: CreateHabitInput, userId: string) {
  return {
    name: h.name,
    description: h.description ?? null,
    frequency: h.frequency ?? 'daily',
    target_count: h.targetCount,
    unit: h.unit,
    order: Date.now(),
    user_id: userId,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseClient();

  // Get user from auth header (simplified - in production use proper auth)
  const userId = req.headers['x-user-id'] as string || 'demo-user';

  try {
    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId)
          .order('order', { ascending: true });

        if (error) throw error;
        return res.status(200).json(data.map(toHabit));
      }

      case 'POST': {
        const input = req.body as CreateHabitInput;
        const { data, error } = await supabase
          .from('habits')
          .insert(toSupabaseHabit(input, userId))
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(toHabit(data));
      }

      case 'PUT': {
        const input = req.body as UpdateHabitInput;
        const { id, ...updates } = input;

        const supabaseUpdates: Partial<SupabaseHabit> = {};
        if (updates.name !== undefined) supabaseUpdates.name = updates.name;
        if (updates.description !== undefined) supabaseUpdates.description = updates.description ?? null;
        if (updates.targetCount !== undefined) supabaseUpdates.target_count = updates.targetCount;
        if (updates.unit !== undefined) supabaseUpdates.unit = updates.unit;
        if (updates.frequency !== undefined) supabaseUpdates.frequency = updates.frequency;
        supabaseUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('habits')
          .update(supabaseUpdates)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(toHabit(data));
      }

      case 'DELETE': {
        const id = req.query.id as string;
        const { error } = await supabase
          .from('habits')
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
    console.error('Habits API error:', err);
    return res.status(500).json({ error: err.message });
  }
}