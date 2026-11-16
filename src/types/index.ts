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

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  durationMinutes: number;
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
  subtasks?: SubTask[];
  completedSubtaskIds?: string[];
  nextReviewDate?: string;
  reviewInterval?: number;
  reviewCount?: number;
  sourceTaskId?: string;
  easeFactor?: number;
  isSpacedReview?: boolean;
  lastReviewRating?: 0 | 1 | 2 | 3;
}

export interface DailyCompletion {
  date: string; // YYYY-MM-DD
  habitCompletions: Record<string, number>; // habitId -> count completed
  taskCompletions: string[]; // studyTaskIds completed
  subtaskCompletions?: Record<string, boolean>; // subtaskId -> completed
  notes?: string;
  completedAt: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  dayEnded?: boolean;
  flexibleDayNumber?: number;
  flexibleTaskCompletions?: string[];
  flexiblePositionBefore?: number;
  flexiblePositionAfter?: number;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  pushTime: string;
  emailTime: string;
  emailAddress?: string;
  reminderTime?: string;
  reminderType?: 'daily-1pm' | 'hourly';
}

export type ActivePlan = 'gcp-production';

export interface StudyNoteRecord {
  date: string; // YYYY-MM-DD
  topic: string;
  summary: string;
  keyConcepts: string[];
  failureModes: string[];
  metricsScale: string[];
  interviewQA: { question: string; answer: string }[];
  codeSnippet?: string;
  rawMarkdown?: string;
  updatedAt?: number;
}

export interface SupabaseSettings {
  url: string;
  anonKey: string;
  syncEnabled: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notificationSettings: NotificationSettings;
  supabaseSettings?: SupabaseSettings;
  initialized?: boolean;
  planVersion?: number;
  flexiblePace?: number;           // tasks per day (default 3)
  planStartDate?: string;          // ISO date when user started the plan (2026-11-01)
  planPosition?: number;           // curriculum tasks completed in sequence (0..N)
  activePlan?: ActivePlan;
  habitsEnabled?: boolean;
  analyticsEnabled?: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: true,
  pushTime: '13:00',
  emailTime: '08:00',
  emailAddress: '',
  reminderTime: '20:00',
  reminderType: 'daily-1pm',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'dark',
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  flexiblePace: 3,
  planStartDate: '2026-11-01',
  planPosition: 0,
  activePlan: 'gcp-production',
  habitsEnabled: true,
  analyticsEnabled: true,
};
