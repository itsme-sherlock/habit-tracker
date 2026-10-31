// Daily Notification Scheduler
// Handles client-side scheduling of daily notifications
// Note: PWAs can't run true background cron jobs, so this runs when app is open

import { getHabits, getTasksForDate, getNotificationSettings, getCompletionForDate } from './db';
import { sendLocalNotification } from './push';
import { sendDailyPlanEmail, DailyPlanEmailData } from './email';
import { format } from 'date-fns';

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let lastNotificationDate: string | null = null;
let lastReminderDate: string | null = null;

export function startScheduler(): void {
  if (schedulerInterval) return; // Already running

  // Check every minute
  schedulerInterval = setInterval(async () => {
    await checkAndSendNotifications();
  }, 60 * 1000);

  // Also check immediately
  checkAndSendNotifications();
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

async function checkAndSendNotifications(): Promise<void> {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const currentTime = format(now, 'HH:mm');

  const settings = await getNotificationSettings();
  if (!settings.pushEnabled && !settings.emailEnabled) return;

  // Check for morning notification (daily plan)
  if (currentTime === settings.pushTime || currentTime === settings.emailTime) {
    if (lastNotificationDate !== today) {
      await sendDailyPlanNotifications(today, settings);
      lastNotificationDate = today;
    }
  }

  // Check for evening reminder
  if (settings.reminderTime && currentTime === settings.reminderTime) {
    if (lastReminderDate !== today) {
      await sendEveningReminder(today, settings);
      lastReminderDate = today;
    }
  }
}

async function sendDailyPlanNotifications(date: string, settings: any): Promise<void> {
  const [habits, tasks] = await Promise.all([
    getHabits(),
    getTasksForDate(date),
  ]);

  const completion = await getCompletionForDate(date);
  const habitCompletions = completion?.habitCompletions || {};

  // Prepare habit data with completion status
  const habitsWithProgress = habits.map(habit => ({
    name: habit.name,
    targetCount: habit.targetCount,
    unit: habit.unit,
    completed: habitCompletions[habit.id] || 0,
  }));

  // Prepare task data
  const tasksWithStatus = tasks.map(task => ({
    title: task.title,
    durationMinutes: task.durationMinutes,
    category: task.category,
    completed: task.completed,
  }));

  const totalStudyHours = tasks.reduce((sum, t) => sum + t.durationMinutes, 0) / 60;

  const emailData: DailyPlanEmailData = {
    date,
    habits: habitsWithProgress,
    tasks: tasksWithStatus,
    totalStudyHours,
  };

  // Send push notification
  if (settings.pushEnabled) {
    const habitSummary = habitsWithProgress.map(h => `${h.name} (${h.completed}/${h.targetCount})`).join(', ');
    const taskSummary = tasksWithStatus.slice(0, 3).map(t => t.title).join(', ');
    const moreTasks = tasksWithStatus.length > 3 ? ` +${tasksWithStatus.length - 3} more` : '';

    await sendLocalNotification('📅 Today\'s Plan', {
      body: `${habitSummary}\n${taskSummary}${moreTasks}`,
      tag: `daily-plan-${date}`,
      data: { date, url: '/' },
    });
  }

  // Send email
  if (settings.emailEnabled && settings.emailAddress) {
    await sendDailyPlanEmail(settings.emailAddress, emailData);
  }
}

async function sendEveningReminder(date: string, settings: any): Promise<void> {
  const completion = await getCompletionForDate(date);

  if (completion) {
    // Day already completed
    return;
  }

  const [habits, tasks] = await Promise.all([
    getHabits(),
    getTasksForDate(date),
  ]);

  const incompleteHabits = habits.filter(h => {
    const completed = completion?.habitCompletions?.[h.id] || 0;
    return completed < h.targetCount;
  });

  const incompleteTasks = tasks.filter(t => !t.completed);

  if (incompleteHabits.length === 0 && incompleteTasks.length === 0) {
    return; // Everything done
  }

  if (settings.pushEnabled) {
    let body = 'Time to wrap up! ';
    if (incompleteHabits.length > 0) {
      body += `${incompleteHabits.length} habit(s) remaining. `;
    }
    if (incompleteTasks.length > 0) {
      body += `${incompleteTasks.length} task(s) remaining. `;
    }
    body += 'Complete your checklist before the day ends.';

    await sendLocalNotification('🌙 Evening Reminder', {
      body,
      tag: `evening-reminder-${date}`,
      data: { date, url: '/' },
    });
  }

  if (settings.emailEnabled && settings.emailAddress) {
    // Could send evening reminder email too
    // For now, just push notification
  }
}

// For testing - trigger notifications immediately
export async function triggerTestNotifications(): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const settings = await getNotificationSettings();
  await sendDailyPlanNotifications(today, settings);
}

// Initialize scheduler when app loads (call from main.tsx)
export function initScheduler(): void {
  // Check if we should restore last notification dates from storage
  const stored = localStorage.getItem('notification-dates');
  if (stored) {
    try {
      const dates = JSON.parse(stored);
      lastNotificationDate = dates.lastNotificationDate;
      lastReminderDate = dates.lastReminderDate;
    } catch {
      // Ignore parse errors
    }
  }

  // Save dates periodically
  setInterval(() => {
    localStorage.setItem('notification-dates', JSON.stringify({
      lastNotificationDate,
      lastReminderDate,
    }));
  }, 5 * 60 * 1000); // Every 5 minutes

  startScheduler();
}

// Call when app is about to unload
export function persistSchedulerState(): void {
  localStorage.setItem('notification-dates', JSON.stringify({
    lastNotificationDate,
    lastReminderDate,
  }));
}