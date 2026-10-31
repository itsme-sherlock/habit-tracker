export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily';
  targetCount: number;
  unit: string;
  createdAt: number;
  order: number;
}

export interface StudyTask {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  durationMinutes: number;
  category: 'study' | 'practice' | 'review' | 'mock-exam';
  completed: boolean;
  completedAt?: number;
}

export interface DailyCompletion {
  date: string; // YYYY-MM-DD
  habitCompletions: Record<string, number>; // habitId -> count completed
  taskCompletions: string[]; // studyTaskIds completed
  notes?: string;
  completedAt: number;
  mood?: 1 | 2 | 3 | 4 | 5;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  pushTime: string; // HH:MM (24hr)
  emailTime: string; // HH:MM
  emailAddress?: string;
  reminderTime?: string; // optional evening reminder
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notificationSettings: NotificationSettings;
  initialized?: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: true,
  pushTime: '08:00',
  emailTime: '08:00',
  emailAddress: '',
  reminderTime: '20:00',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'system',
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
};

export const HABIT_STORE = 'habits';
export const TASK_STORE = 'studyTasks';
export const COMPLETION_STORE = 'dailyCompletions';
export const SETTINGS_STORE = 'settings';
export const PUSH_SUBSCRIPTION_STORE = 'pushSubscription';