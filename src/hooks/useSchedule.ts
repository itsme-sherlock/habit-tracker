import { useState, useEffect, useCallback } from 'react';
import {
  getTasksForDate,
  getTasksForDateRange,
  addStudyTask,
  updateStudyTask,
  deleteStudyTask,
  bulkAddStudyTasks,
  type StudyTask,
} from '../services/db';
import { format, addDays, parseISO, isBefore, isAfter } from 'date-fns';
import { ensurePlanSeeded } from '../utils/init';
import { manualSync } from '../services/sync';

export function useSchedule() {
  const [tasks, setTasks] = useState<Record<string, StudyTask[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasksForDate = useCallback(async (date: string) => {
    try {
      const data = await getTasksForDate(date);
      setTasks(prev => ({ ...prev, [date]: data }));
      return data;
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
      return [];
    }
  }, []);

  const loadTasksForRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const data = await getTasksForDateRange(startDate, endDate);
      const grouped: Record<string, StudyTask[]> = {};
      for (const task of data) {
        if (!grouped[task.date]) grouped[task.date] = [];
        grouped[task.date].push(task);
      }
      setTasks(prev => ({ ...prev, ...grouped }));
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task: Omit<StudyTask, 'id'>) => {
    const newTask = await addStudyTask(task);
    setTasks(prev => {
      const dateTasks = prev[task.date] || [];
      return { ...prev, [task.date]: [...dateTasks, newTask] };
    });
    void manualSync();
    return newTask;
  }, []);

  const editTask = useCallback(async (id: string, updates: Partial<StudyTask>) => {
    const task = Object.values(tasks).flat().find(t => t.id === id);
    if (!task) return;

    await updateStudyTask(id, updates);
    setTasks(prev => {
      const dateTasks = prev[task.date] || [];
      return {
        ...prev,
        [task.date]: dateTasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
      };
    });
    void manualSync();
  }, [tasks]);

  const removeTask = useCallback(async (id: string) => {
    const task = Object.values(tasks).flat().find(t => t.id === id);
    if (!task) return;

    await deleteStudyTask(id);
    setTasks(prev => {
      const dateTasks = prev[task.date] || [];
      return {
        ...prev,
        [task.date]: dateTasks.filter(t => t.id !== id),
      };
    });
    void manualSync();
  }, [tasks]);

  const bulkCreateTasks = useCallback(async (newTasks: Omit<StudyTask, 'id'>[]) => {
    const created = await bulkAddStudyTasks(newTasks);
    setTasks(prev => {
      const next = { ...prev };
      for (const task of created) {
        if (!next[task.date]) next[task.date] = [];
        next[task.date].push(task);
      }
      return next;
    });
    void manualSync();
    return created;
  }, []);

  const toggleTaskComplete = useCallback(async (id: string, completed: boolean) => {
    const task = Object.values(tasks).flat().find(t => t.id === id);
    if (!task) return;

    await editTask(id, { completed, completedAt: completed ? Date.now() : undefined });
    void manualSync();
  }, [tasks, editTask]);

  const getTasksForDate = useCallback((date: string) => {
    return tasks[date] || [];
  }, [tasks]);

  // Load every task (the plan spans months) once seeding has finished
  useEffect(() => {
    ensurePlanSeeded()
      .catch(err => {
        console.error(err);
        setError(`Could not load the study plan: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => loadTasksForRange('0000-01-01', '9999-12-31'));
  }, [loadTasksForRange]);

  return {
    tasks,
    loading,
    error,
    loadTasksForDate,
    loadTasksForRange,
    createTask,
    editTask,
    removeTask,
    bulkCreateTasks,
    toggleTaskComplete,
    getTasksForDate,
  };
}

// Helper to generate recurring tasks
export function generateRecurringTasks(
  template: Omit<StudyTask, 'id' | 'date'>,
  startDate: string,
  endDate: string,
  daysOfWeek: number[] // 0=Sun, 1=Mon, etc.
): Omit<StudyTask, 'id'>[] {
  const tasks: Omit<StudyTask, 'id'>[] = [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  let current = start;

  while (!isAfter(current, end)) {
    const dayOfWeek = current.getDay();
    if (daysOfWeek.includes(dayOfWeek)) {
      tasks.push({
        ...template,
        date: format(current, 'yyyy-MM-dd'),
      });
    }
    current = addDays(current, 1);
  }

  return tasks;
}