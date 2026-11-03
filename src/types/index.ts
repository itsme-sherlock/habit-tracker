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
  category: 'study' | 'practice' | 'review' | 'spaced-review' | 'mock-exam';
  completed: boolean;
  completedAt?: number;
  // Spaced repetition fields
  nextReviewDate?: string;        // YYYY-MM-DD
  reviewInterval?: number;        // days until next review
  reviewCount?: number;           // times reviewed (0 = never)
  sourceTaskId?: string;          // link to original study/practice task
  easeFactor?: number;            // SM-2 ease factor (default 2.5)
  isSpacedReview?: boolean;       // true for algorithmic reviews (vs daily drills)
  lastReviewRating?: 0 | 1 | 2 | 3; // 0=Again, 1=Hard, 2=Good, 3=Easy
}

export interface DailyCompletion {
  date: string; // YYYY-MM-DD
  habitCompletions: Record<string, number>; // habitId -> count completed
  taskCompletions: string[]; // studyTaskIds completed
  notes?: string;
  completedAt: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  dayEnded?: boolean;
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
  planVersion?: number;
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