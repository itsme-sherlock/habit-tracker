import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudyTask, Habit, DailyCompletion, AppSettings, DEFAULT_APP_SETTINGS } from '../types';
import { GCP_CURRICULUM, DEFAULT_HABITS, PLAN_START, PLAN_END } from '../data/gcpCurriculum';
import { getTaskSubmodules } from '../utils/submodules';
import { SupabaseService } from './supabase';

const STORAGE_KEYS = {
  TASKS: '@de60_study_tasks',
  HABITS: '@de60_habits',
  COMPLETIONS: '@de60_daily_completions',
  SETTINGS: '@de60_app_settings',
  INITIALIZED: '@de60_initialized_v1',
};

// Generate deterministic ID
export function generateTaskId(date: string, category: string, index: number): string {
  return `task_${date}_${category}_${index}`;
}

export const StorageService = {
  /**
   * Initializes default data if first run
   */
  async init(): Promise<void> {
    try {
      const initialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!initialized) {
        // Initialize curriculum tasks
        const initialTasks: StudyTask[] = GCP_CURRICULUM.map((t, idx) => ({
          ...t,
          id: generateTaskId(t.date, t.category, idx),
          completed: false,
        }));

        // Initialize habits
        const initialHabits: Habit[] = DEFAULT_HABITS.map((h, idx) => ({
          ...h,
          id: `habit_${idx + 1}`,
          createdAt: Date.now(),
          order: idx,
        }));

        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTasks));
        await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(initialHabits));
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_APP_SETTINGS));
        await AsyncStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify({}));
        await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }

      // Initialize Supabase if credentials exist in settings
      const settingsStr = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsStr) {
        try {
          const s = JSON.parse(settingsStr);
          if (s.supabaseSettings?.url && s.supabaseSettings?.anonKey) {
            SupabaseService.initClient(s.supabaseSettings.url, s.supabaseSettings.anonKey);
          }
        } catch (err) {}
      }
    } catch (e) {
      console.error('Failed to initialize storage:', e);
    }
  },

  /**
   * Fetch all study tasks
   */
  async getTasks(): Promise<StudyTask[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (data) {
        return JSON.parse(data);
      }
      return GCP_CURRICULUM.map((t, idx) => ({
        ...t,
        id: generateTaskId(t.date, t.category, idx),
        completed: false,
      }));
    } catch (e) {
      console.error('Error reading tasks:', e);
      return [];
    }
  },

  /**
   * Toggle task completion
   */
  async toggleTask(taskId: string): Promise<StudyTask[]> {
    try {
      const tasks = await this.getTasks();
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return tasks;

      const target = tasks[taskIndex];
      const newStatus = !target.completed;
      const submodules = getTaskSubmodules(target);

      tasks[taskIndex] = {
        ...target,
        completed: newStatus,
        completedAt: newStatus ? Date.now() : undefined,
        completedSubtaskIds: newStatus ? submodules.map((s) => s.id) : [],
      };

      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

      // Sync into daily completion record
      await this.recordTaskCompletion(target.date, taskId, newStatus);

      return tasks;
    } catch (e) {
      console.error('Error toggling task:', e);
      return [];
    }
  },

  /**
   * Toggle individual subtask / submodule completion
   */
  async toggleSubtask(taskId: string, subtaskId: string): Promise<StudyTask[]> {
    try {
      const tasks = await this.getTasks();
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return tasks;

      const target = tasks[taskIndex];
      const submodules = getTaskSubmodules(target);
      const currentSet = new Set(
        target.completedSubtaskIds || (target.completed ? submodules.map((s) => s.id) : [])
      );

      if (currentSet.has(subtaskId)) {
        currentSet.delete(subtaskId);
      } else {
        currentSet.add(subtaskId);
      }

      const completedIds = Array.from(currentSet);
      const allDone = submodules.length > 0 && completedIds.length >= submodules.length;

      tasks[taskIndex] = {
        ...target,
        completed: allDone,
        completedAt: allDone ? Date.now() : undefined,
        completedSubtaskIds: completedIds,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      await this.recordTaskCompletion(target.date, taskId, allDone);

      return tasks;
    } catch (e) {
      console.error('Error toggling subtask:', e);
      return [];
    }
  },

  /**
   * Fetch habits
   */
  async getHabits(): Promise<Habit[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      if (data) {
        return JSON.parse(data);
      }
      return DEFAULT_HABITS.map((h, idx) => ({
        ...h,
        id: `habit_${idx + 1}`,
        createdAt: Date.now(),
        order: idx,
      }));
    } catch (e) {
      console.error('Error reading habits:', e);
      return [];
    }
  },

  /**
   * Fetch all daily completions mapped by YYYY-MM-DD
   */
  async getCompletions(): Promise<Record<string, DailyCompletion>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETIONS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error reading completions:', e);
      return {};
    }
  },

  /**
   * Fetch completion for a specific date
   */
  async getCompletionForDate(date: string): Promise<DailyCompletion> {
    const all = await this.getCompletions();
    return (
      all[date] || {
        date,
        habitCompletions: {},
        taskCompletions: [],
        completedAt: Date.now(),
      }
    );
  },

  /**
   * Update habit progress (+1 / -1) for a specific date
   */
  async updateHabitCount(habitId: string, delta: number, date: string): Promise<DailyCompletion> {
    try {
      const all = await this.getCompletions();
      const current = all[date] || {
        date,
        habitCompletions: {},
        taskCompletions: [],
        completedAt: Date.now(),
      };

      const currentCount = current.habitCompletions[habitId] || 0;
      const newCount = Math.max(0, currentCount + delta);

      current.habitCompletions = {
        ...current.habitCompletions,
        [habitId]: newCount,
      };
      current.completedAt = Date.now();

      all[date] = current;
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(all));
      SupabaseService.saveCompletion(current).catch(() => {});
      return current;
    } catch (e) {
      console.error('Error updating habit count:', e);
      throw e;
    }
  },

  /**
   * Record task in daily completion
   */
  async recordTaskCompletion(date: string, taskId: string, completed: boolean): Promise<void> {
    try {
      const all = await this.getCompletions();
      const current = all[date] || {
        date,
        habitCompletions: {},
        taskCompletions: [],
        completedAt: Date.now(),
      };

      const set = new Set(current.taskCompletions || []);
      if (completed) {
        set.add(taskId);
      } else {
        set.delete(taskId);
      }

      current.taskCompletions = Array.from(set);
      all[date] = current;
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(all));
      SupabaseService.saveCompletion(current).catch(() => {});
    } catch (e) {
      console.error('Error recording task completion:', e);
    }
  },

  /**
   * Save notes and mood for a date
   */
  async saveDayReflection(date: string, notes?: string, mood?: 1 | 2 | 3 | 4 | 5): Promise<DailyCompletion> {
    try {
      const all = await this.getCompletions();
      const current = all[date] || {
        date,
        habitCompletions: {},
        taskCompletions: [],
        completedAt: Date.now(),
      };

      if (notes !== undefined) current.notes = notes;
      if (mood !== undefined) current.mood = mood;

      all[date] = current;
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(all));
      SupabaseService.saveCompletion(current).catch(() => {});
      return current;
    } catch (e) {
      console.error('Error saving reflection:', e);
      throw e;
    }
  },

  /**
   * App Settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_APP_SETTINGS;
    } catch (e) {
      return DEFAULT_APP_SETTINGS;
    }
  },

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));

      if (updated.supabaseSettings?.url && updated.supabaseSettings?.anonKey) {
        SupabaseService.initClient(updated.supabaseSettings.url, updated.supabaseSettings.anonKey);
      }

      return updated;
    } catch (e) {
      console.error('Error updating settings:', e);
      throw e;
    }
  },

  /**
   * Reset all progress back to pristine Nov 1 start state
   */
  async resetAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      await this.init();
    } catch (e) {
      console.error('Error resetting storage:', e);
    }
  },

  /**
   * Optional helper to seed realistic progress up to current date (for previewing analytics/streak)
   */
  async seedDemoProgress(): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const completions: Record<string, DailyCompletion> = {};
      const habits = await this.getHabits();

      // Complete tasks from 2026-11-01 to 2026-11-15 (yesterday)
      const targetDates = new Set(
        Array.from({ length: 15 }, (_, i) => {
          const d = i + 1;
          return `2026-11-${d < 10 ? '0' + d : d}`;
        })
      );

      tasks.forEach((t) => {
        if (targetDates.has(t.date)) {
          t.completed = true;
          t.completedAt = Date.now();

          if (!completions[t.date]) {
            completions[t.date] = {
              date: t.date,
              habitCompletions: {},
              taskCompletions: [],
              completedAt: Date.now(),
              mood: 4,
            };
          }
          completions[t.date].taskCompletions.push(t.id);
        }
      });

      // Also set habits for those days
      Object.keys(completions).forEach((date) => {
        habits.forEach((h) => {
          completions[date].habitCompletions[h.id] = h.targetCount;
        });
      });

      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
    } catch (e) {
      console.error('Error seeding demo progress:', e);
    }
  },
};
