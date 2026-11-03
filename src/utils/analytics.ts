import { format, parseISO, startOfWeek, endOfWeek, differenceInCalendarDays, isBefore, isAfter, isSameDay, addDays } from 'date-fns';
import type { StudyTask, DailyCompletion } from '../types';

export interface WeeklyTrendPoint {
  week: string;           // "2026-W45" format
  weekLabel: string;      // "Nov 3-9"
  completionRate: number; // 0-100
  hoursStudied: number;   // actual hours completed
  hoursPlanned: number;   // planned hours for that week
}

export interface CategoryStats {
  category: string;
  completed: number;
  total: number;
  rate: number;           // 0-100
  hoursCompleted: number;
  hoursPlanned: number;
}

export interface StudyHoursPoint {
  week: string;
  weekLabel: string;
  planned: number;
  actual: number;
}

export interface StreakData {
  current: number;
  longest: number;
  totalActiveDays: number;
}

export interface HeatmapPoint {
  date: string;   // YYYY-MM-DD
  count: number;  // number of completions (habits + tasks)
}

export interface AnalyticsData {
  weeklyTrend: WeeklyTrendPoint[];
  categoryStats: CategoryStats[];
  studyHours: StudyHoursPoint[];
  streak: StreakData;
  heatmap: HeatmapPoint[];
  readinessScore: number; // 0-100
}

/**
 * Calculate weekly completion trend from tasks and completions
 */
export function calculateWeeklyTrend(
  tasks: StudyTask[],
  completions: DailyCompletion[],
  startDate: string,
  endDate: string
): WeeklyTrendPoint[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // Group tasks by week
  const tasksByWeek = new Map<string, StudyTask[]>();
  for (const task of tasks) {
    const taskDate = parseISO(task.date);
    if (isBefore(taskDate, start) || isAfter(taskDate, end)) continue;

    const weekStart = startOfWeek(taskDate, { weekStartsOn: 1 }); // Monday start
    const weekKey = format(weekStart, 'yyyy-\'W\'ww');

    if (!tasksByWeek.has(weekKey)) {
      tasksByWeek.set(weekKey, []);
    }
    tasksByWeek.get(weekKey)!.push(task);
  }

  // Group completions by week
  const completionsByWeek = new Map<string, DailyCompletion[]>();
  for (const completion of completions) {
    const compDate = parseISO(completion.date);
    if (isBefore(compDate, start) || isAfter(compDate, end)) continue;

    const weekStart = startOfWeek(compDate, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-\'W\'ww');

    if (!completionsByWeek.has(weekKey)) {
      completionsByWeek.set(weekKey, []);
    }
    completionsByWeek.get(weekKey)!.push(completion);
  }

  // Build weekly trend points
  const weeks: WeeklyTrendPoint[] = [];
  const sortedWeekKeys = Array.from(tasksByWeek.keys()).sort();

  for (const weekKey of sortedWeekKeys) {
    const weekTasks = tasksByWeek.get(weekKey) || [];
    const weekCompletions = completionsByWeek.get(weekKey) || [];

    const totalTasks = weekTasks.length;
    const completedTaskIds = new Set<string>();
    let hoursStudied = 0;
    let hoursPlanned = 0;

    for (const task of weekTasks) {
      hoursPlanned += task.durationMinutes / 60;
      const isCompleted = task.completed || weekCompletions.some(c => c.taskCompletions.includes(task.id));
      if (isCompleted) {
        completedTaskIds.add(task.id);
        hoursStudied += task.durationMinutes / 60;
      }
    }

    const completionRate = totalTasks > 0 ? Math.round((completedTaskIds.size / totalTasks) * 100) : 0;

    const weekStartDate = parseISO(weekKey + '-1'); // Monday of that week
    const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
    const weekLabel = `${format(weekStartDate, 'MMM d')}-${format(weekEndDate, 'd')}`;

    weeks.push({
      week: weekKey,
      weekLabel,
      completionRate,
      hoursStudied: Math.round(hoursStudied * 10) / 10,
      hoursPlanned: Math.round(hoursPlanned * 10) / 10,
    });
  }

  return weeks;
}

/**
 * Calculate completion stats by category
 */
export function calculateCategoryStats(
  tasks: StudyTask[],
  completions: DailyCompletion[]
): CategoryStats[] {
  const categories = ['study', 'practice', 'review', 'spaced-review', 'mock-exam'] as const;

  const completionTaskIds = new Set<string>();
  for (const c of completions) {
    for (const id of c.taskCompletions) {
      completionTaskIds.add(id);
    }
  }

  const stats: CategoryStats[] = [];

  for (const category of categories) {
    const categoryTasks = tasks.filter(t => t.category === category);
    const completed = categoryTasks.filter(t => t.completed || completionTaskIds.has(t.id)).length;
    const total = categoryTasks.length;
    const hoursCompleted = categoryTasks
      .filter(t => t.completed || completionTaskIds.has(t.id))
      .reduce((sum, t) => sum + t.durationMinutes / 60, 0);
    const hoursPlanned = categoryTasks.reduce((sum, t) => sum + t.durationMinutes / 60, 0);

    stats.push({
      category: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      hoursCompleted: Math.round(hoursCompleted * 10) / 10,
      hoursPlanned: Math.round(hoursPlanned * 10) / 10,
    });
  }

  return stats.filter(s => s.total > 0); // Only show categories with tasks
}

/**
 * Calculate study hours per week (planned vs actual)
 */
export function calculateStudyHours(
  tasks: StudyTask[],
  completions: DailyCompletion[],
  startDate: string,
  endDate: string
): StudyHoursPoint[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  const completionTaskIds = new Set<string>();
  for (const c of completions) {
    for (const id of c.taskCompletions) {
      completionTaskIds.add(id);
    }
  }

  const hoursByWeek = new Map<string, { planned: number; actual: number; weekStart: Date }>();

  for (const task of tasks) {
    const taskDate = parseISO(task.date);
    if (isBefore(taskDate, start) || isAfter(taskDate, end)) continue;

    const weekStart = startOfWeek(taskDate, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-\'W\'ww');

    if (!hoursByWeek.has(weekKey)) {
      hoursByWeek.set(weekKey, { planned: 0, actual: 0, weekStart });
    }

    const entry = hoursByWeek.get(weekKey)!;
    entry.planned += task.durationMinutes / 60;

    const isCompleted = task.completed || completionTaskIds.has(task.id);
    if (isCompleted) {
      entry.actual += task.durationMinutes / 60;
    }
  }

  const points: StudyHoursPoint[] = [];
  const sortedKeys = Array.from(hoursByWeek.keys()).sort();

  for (const key of sortedKeys) {
    const entry = hoursByWeek.get(key)!;
    const weekEndDate = endOfWeek(entry.weekStart, { weekStartsOn: 1 });
    const weekLabel = `${format(entry.weekStart, 'MMM d')}-${format(weekEndDate, 'd')}`;

    points.push({
      week: key,
      weekLabel,
      planned: Math.round(entry.planned * 10) / 10,
      actual: Math.round(entry.actual * 10) / 10,
    });
  }

  return points;
}

/**
 * Calculate streak data from completions
 */
export function calculateStreak(completions: DailyCompletion[]): StreakData {
  if (completions.length === 0) {
    return { current: 0, longest: 0, totalActiveDays: 0 };
  }

  // Sort completions by date
  const sorted = [...completions].sort((a, b) => a.date.localeCompare(b.date));

  // Get unique active dates (days with any completion)
  const activeDates = new Set<string>();
  for (const c of sorted) {
    // A day is "active" if it has habit completions or task completions or was ended
    const hasHabits = Object.values(c.habitCompletions).some(v => v > 0);
    const hasTasks = c.taskCompletions.length > 0;
    const dayEnded = c.dayEnded === true;

    if (hasHabits || hasTasks || dayEnded) {
      activeDates.add(c.date);
    }
  }

  const activeDateArray = Array.from(activeDates).sort();
  const totalActiveDays = activeDateArray.length;

  if (totalActiveDays === 0) {
    return { current: 0, longest: 0, totalActiveDays: 0 };
  }

  // Calculate streaks
  let longest = 1;
  let current = 1;

  for (let i = 1; i < activeDateArray.length; i++) {
    const prev = parseISO(activeDateArray[i - 1]);
    const curr = parseISO(activeDateArray[i]);
    const diff = differenceInCalendarDays(curr, prev);

    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  // Check if current streak is ongoing (includes today or yesterday)
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-DD');
  const lastActive = activeDateArray[activeDateArray.length - 1];

  const isCurrentStreakActive = lastActive === today || lastActive === yesterday;
  const currentStreak = isCurrentStreakActive ? current : 0;

  return {
    current: currentStreak,
    longest,
    totalActiveDays,
  };
}

/**
 * Calculate heatmap data (daily completion counts)
 */
export function calculateHeatmap(completions: DailyCompletion[]): HeatmapPoint[] {
  const map = new Map<string, number>();

  for (const c of completions) {
    const hasHabits = Object.values(c.habitCompletions).some(v => v > 0);
    const hasTasks = c.taskCompletions.length > 0;
    const dayEnded = c.dayEnded === true;

    if (hasHabits || hasTasks || dayEnded) {
      map.set(c.date, (map.get(c.date) || 0) + 1);
    }
  }

  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate exam readiness score (0-100)
 * Weighted by: completion rate (40%), recency (20%), practice ratio (20%), mock exams (20%)
 */
export function calculateReadinessScore(
  tasks: StudyTask[],
  completions: DailyCompletion[]
): number {
  if (tasks.length === 0) return 0;

  const completionTaskIds = new Set<string>();
  for (const c of completions) {
    for (const id of c.taskCompletions) {
      completionTaskIds.add(id);
    }
  }

  // 1. Overall completion rate (40%)
  const completedTasks = tasks.filter(t => t.completed || completionTaskIds.has(t.id)).length;
  const completionRate = completedTasks / tasks.length;

  // 2. Recency factor (20%) - how recent are completions?
  const now = new Date();
  let recencyScore = 0;
  let recentCompletions = 0;

  for (const task of tasks) {
    if (task.completed || completionTaskIds.has(task.id)) {
      const completedAt = task.completedAt || 0;
      const daysAgo = differenceInCalendarDays(now, new Date(completedAt));

      if (daysAgo <= 7) recencyScore += 1;
      else if (daysAgo <= 14) recencyScore += 0.7;
      else if (daysAgo <= 30) recencyScore += 0.4;
      else recencyScore += 0.1;

      recentCompletions++;
    }
  }

  const recencyFactor = recentCompletions > 0 ? recencyScore / recentCompletions : 0;

  // 3. Practice ratio (20%) - practice tasks vs study tasks
  const studyTasks = tasks.filter(t => t.category === 'study').length;
  const practiceTasks = tasks.filter(t => t.category === 'practice').length;
  const completedStudy = tasks.filter(t => t.category === 'study' && (t.completed || completionTaskIds.has(t.id))).length;
  const completedPractice = tasks.filter(t => t.category === 'practice' && (t.completed || completionTaskIds.has(t.id))).length;

  const studyRate = studyTasks > 0 ? completedStudy / studyTasks : 1;
  const practiceRate = practiceTasks > 0 ? completedPractice / practiceTasks : 1;

  // Practice is more important for exam readiness
  const practiceRatio = practiceTasks > 0
    ? (practiceRate * 0.7 + studyRate * 0.3)
    : studyRate;

  // 4. Mock exam factor (20%)
  const mockExamTasks = tasks.filter(t => t.category === 'mock-exam').length;
  const completedMockExams = tasks.filter(t => t.category === 'mock-exam' && (t.completed || completionTaskIds.has(t.id))).length;
  const mockExamFactor = mockExamTasks > 0 ? completedMockExams / mockExamTasks : 0.5; // Neutral if no mock exams yet

  // Weighted score
  const score = (
    completionRate * 0.40 +
    recencyFactor * 0.20 +
    practiceRatio * 0.20 +
    mockExamFactor * 0.20
  ) * 100;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Get all analytics data in one call
 */
export function getAnalyticsData(
  tasks: StudyTask[],
  completions: DailyCompletion[],
  startDate: string = '2026-11-01',
  endDate: string = '2027-03-01'
): AnalyticsData {
  return {
    weeklyTrend: calculateWeeklyTrend(tasks, completions, startDate, endDate),
    categoryStats: calculateCategoryStats(tasks, completions),
    studyHours: calculateStudyHours(tasks, completions, startDate, endDate),
    streak: calculateStreak(completions),
    heatmap: calculateHeatmap(completions),
    readinessScore: calculateReadinessScore(tasks, completions),
  };
}