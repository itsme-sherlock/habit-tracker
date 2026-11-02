import { useState, useEffect, useCallback } from 'react';
import {
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
  reorderHabits,
  type Habit,
} from '../services/db';
import { manualSync } from '../services/sync';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getHabits();
      setHabits(data);
      setError(null);
    } catch (err) {
      setError('Failed to load habits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const createHabit = useCallback(async (habit: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    const newHabit = await addHabit(habit);
    setHabits(prev => [...prev, newHabit]);
    void manualSync();
    return newHabit;
  }, []);

  const editHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    await updateHabit(id, updates);
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
    void manualSync();
  }, []);

  const removeHabit = useCallback(async (id: string) => {
    await deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
    void manualSync();
  }, []);

  const moveHabit = useCallback(async (habitIds: string[]) => {
    await reorderHabits(habitIds);
    // Re-sort local state based on new order
    setHabits(prev => {
      const map = new Map(prev.map(h => [h.id, h]));
      return habitIds.map(id => map.get(id)!).filter(Boolean);
    });
    void manualSync();
  }, []);

  const incrementHabit = useCallback(async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      const current = habit.targetCount; // This is wrong - need to track completion separately
      // Actually, habit completions are tracked in dailyCompletions, not in habit itself
      // This function would need access to daily completion - skip for now
    }
  }, [habits]);

  return {
    habits,
    loading,
    error,
    createHabit,
    editHabit,
    removeHabit,
    moveHabit,
    refresh: loadHabits,
  };
}