import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseClient();
  const userId = req.headers['x-user-id'] as string || 'demo-user';
  const days = parseInt(req.query.days as string) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  try {
    // Get habits
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    // Get tasks in range
    const { data: tasks } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr);

    // Get completions in range
    const { data: completions } = await supabase
      .from('daily_completions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr);

    // Calculate stats
    const totalHabits = habits?.length || 0;
    const completedHabitDays = new Set(
      completions?.flatMap(c =>
        Object.entries(c.habit_completions || {})
          .filter(([habitId, count]) => {
            const habit = habits?.find(h => h.id === habitId);
            return habit && count >= habit.target_count;
          })
          .map(([habitId]) => `${c.date}-${habitId}`)
      ) || []
    ).size;

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;

    const totalStudyMinutes = tasks?.reduce((sum, t) =>
      t.completed ? sum + t.duration_minutes : sum, 0) || 0;

    const streak = calculateStreak(completions || [], habits || []);

    return res.status(200).json({
      period: { days, startDate: startDateStr, endDate: new Date().toISOString().split('T')[0] },
      habits: {
        total: totalHabits,
        completedDays: completedHabitDays,
        completionRate: totalHabits > 0 ? Math.round((completedHabitDays / (totalHabits * days)) * 100) : 0,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        studyHours: Math.round(totalStudyMinutes / 60 * 10) / 10,
      },
      streak: { current: streak },
    });
  } catch (err: any) {
    console.error('Stats API error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function calculateStreak(completions: any[], habits: any[]): number {
  if (!habits.length) return 0;
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    if (i === 0 && dateStr > today) continue;

    const dayCompletion = completions.find(c => c.date === dateStr);
    if (!dayCompletion) break;

    const allHabitsDone = habits.every(h =>
      (dayCompletion.habit_completions?.[h.id] || 0) >= h.target_count
    );

    if (!allHabitsDone) break;
    streak++;
  }
  return streak;
}