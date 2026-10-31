import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Target, Flame, Calendar, ChevronLeft, ChevronRight, Sun, Moon, Settings, Bell, Mail, Download, Upload, RefreshCw, Monitor } from 'lucide-react';
import { format, parseISO, addDays, isToday, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import type { Habit, StudyTask, DailyCompletion, AppSettings } from '../types';
import { HabitList } from './HabitList';
import { ScheduleEditor } from './ScheduleEditor';
import { SettingsComponent } from './Settings';
import { getNotificationIcon, getCategoryColor, formatDuration } from '../utils/notifications';
import { getCompletionForDate, saveDailyCompletion, getHabits, getTasksForDate, getSettings, saveSettings } from '../services/db';
import { useHabits } from '../hooks/useHabits';
import { useSchedule } from '../hooks/useSchedule';
import { useNotifications } from '../hooks/useNotifications';
import { usePWA } from '../hooks/usePWA';
import { useTheme } from '../context/ThemeContext';

type View = 'today' | 'schedule' | 'settings';

export function Dashboard() {
  const [view, setView] = useState<View>('today');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showEndDayModal, setShowEndDayModal] = useState(false);
  const [endDayNotes, setEndDayNotes] = useState('');
  const [endDayMood, setEndDayMood] = useState<1|2|3|4|5>(3);
  const [completion, setCompletion] = useState<DailyCompletion | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  // Load app settings
  useEffect(() => {
    getSettings().then(setAppSettings);
  }, []);

  const { habits, loading: habitsLoading, createHabit, editHabit, removeHabit, moveHabit, refresh: refreshHabits } = useHabits();
  const { tasks, loading: tasksLoading, createTask, editTask, removeTask, toggleTaskComplete, getTasksForDate, loadTasksForDate, loadTasksForRange } = useSchedule();
  const { settings: notificationSettings, updateSettings, triggerTest } = useNotifications();
  const { installable, installed, install, updateAvailable, applyUpdate, offline } = usePWA();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const todayTasks = getTasksForDate(selectedDate);
  const todayCompletion = completion;

  // Load completion for selected date
  useEffect(() => {
    loadCompletion();
  }, [selectedDate]);

  const loadCompletion = async () => {
    const c = await getCompletionForDate(selectedDate);
    setCompletion(c);
  };

  const habitCompletions = todayCompletion?.habitCompletions || {};
  const taskCompletions = todayCompletion?.taskCompletions || [];

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => (habitCompletions[h.id] || 0) >= h.targetCount).length;
  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter(t => t.completed || taskCompletions.includes(t.id)).length;

  const overallProgress = totalHabits + totalTasks > 0
    ? Math.round(((completedHabits + completedTasks) / (totalHabits + totalTasks)) * 100)
    : 0;

  const handleIncrementHabit = (id: string) => {
    const current = habitCompletions[id] || 0;
    const habit = habits.find(h => h.id === id);
    if (habit && current < habit.targetCount) {
      const newCompletions = { ...habitCompletions, [id]: current + 1 };
      setCompletion(prev => prev ? { ...prev, habitCompletions: newCompletions } : null);
    }
  };

  const handleDecrementHabit = (id: string) => {
    const current = habitCompletions[id] || 0;
    if (current > 0) {
      const newCompletions = { ...habitCompletions, [id]: current - 1 };
      setCompletion(prev => prev ? { ...prev, habitCompletions: newCompletions } : null);
    }
  };

  const handleToggleTask = async (id: string) => {
    await toggleTaskComplete(id, !todayTasks.find(t => t.id === id)?.completed);
    loadCompletion();
  };

  const handleEndDay = async () => {
    const newCompletion: DailyCompletion = {
      date: selectedDate,
      habitCompletions,
      taskCompletions: todayTasks.filter(t => t.completed || taskCompletions.includes(t.id)).map(t => t.id),
      notes: endDayNotes,
      completedAt: Date.now(),
      mood: endDayMood,
    };
    await saveDailyCompletion(newCompletion);
    setCompletion(newCompletion);
    setShowEndDayModal(false);
    setEndDayNotes('');
    setEndDayMood(3);
  };

  const handleEditHabit = (habit: Habit) => {
    const name = prompt('Habit name:', habit.name);
    if (name && name !== habit.name) {
      editHabit(habit.id, { name });
    }
    const target = prompt('Target count:', habit.targetCount.toString());
    if (target) {
      editHabit(habit.id, { targetCount: parseInt(target) });
    }
    const unit = prompt('Unit (times, hours, minutes):', habit.unit);
    if (unit) {
      editHabit(habit.id, { unit });
    }
  };

  const handleAddHabit = () => {
    const name = prompt('New habit name:');
    if (!name) return;
    const target = parseInt(prompt('Target count:', '1') || '1');
    const unit = prompt('Unit (times, hours, minutes):', 'times') || 'times';
    createHabit({ name, targetCount: target, unit, description: '', frequency: 'daily' });
  };

  const handleDeleteHabit = async (id: string) => {
    if (confirm('Delete this habit?')) {
      await removeHabit(id);
    }
  };

  const handleReorderHabits = (habitIds: string[]) => {
    moveHabit(habitIds);
  };

  if (view === 'schedule') {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Study Schedule</h1>
          <button
            onClick={() => setView('today')}
            className="btn-secondary"
          >
            ← Today
          </button>
        </div>
        <ScheduleEditor
          tasks={tasks}
          onCreateTask={createTask}
          onUpdateTask={editTask}
          onDeleteTask={removeTask}
          onToggleComplete={toggleTaskComplete}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <button
            onClick={() => setView('today')}
            className="btn-secondary"
          >
            ← Today
          </button>
        </div>
        <SettingsComponent
          settings={appSettings || { theme: 'system', notificationSettings: { pushEnabled: true, emailEnabled: true, pushTime: '08:00', emailTime: '08:00', emailAddress: '', reminderTime: '20:00' } }}
          onSettingsChange={async (s) => { await saveSettings(s); setAppSettings(s); }}
        />
      </div>
    );
  }

  // Today view
  const isTodaySelected = isToday(parseISO(selectedDate));
  const canEndDay = isTodaySelected && !todayCompletion;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate), -1), 'yyyy-MM-dd'))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {format(parseISO(selectedDate), 'EEEE, MMM d')}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {isTodaySelected ? 'Today' : format(parseISO(selectedDate), 'yyyy-MM-dd')}
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}
              disabled={isTodaySelected}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => {
                const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
                const currentIndex = themes.indexOf(theme);
                const nextIndex = (currentIndex + 1) % themes.length;
                setTheme(themes[nextIndex]);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title={`Current: ${theme} (click to cycle)`}
              aria-label="Toggle theme"
            >
              {theme === 'light' && <Sun className="w-5 h-5 text-yellow-500" />}
              {theme === 'dark' && <Moon className="w-5 h-5 text-blue-400" />}
              {theme === 'system' && <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            </button>
            {updateAvailable && (
              <button onClick={applyUpdate} className="btn-secondary text-sm">
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Update
              </button>
            )}
            {installable && !installed && (
              <button onClick={install} className="btn-primary text-sm">
                <Download className="w-4 h-4 mr-1" /> Install
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Ring */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
                className="dark:stroke-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="8"
                strokeDasharray={`${(overallProgress / 100) * 351.86} 351.86`}
                strokeLinecap="round"
                className="progress-ring-circle transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{overallProgress}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="card p-3 text-center">
            <div className="text-2xl font-bold text-primary-500">{completedHabits}/{totalHabits}</div>
            <div className="text-xs text-gray-500">Habits</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{completedTasks}/{totalTasks}</div>
            <div className="text-xs text-gray-500">Tasks</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {todayTasks.reduce((sum, t) => sum + (t.completed || taskCompletions.includes(t.id) ? t.durationMinutes : 0), 0) / 60}h
            </div>
            <div className="text-xs text-gray-500">Studied</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {todayTasks.reduce((sum, t) => sum + t.durationMinutes, 0) / 60}h
            </div>
            <div className="text-xs text-gray-500">Planned</div>
          </div>
        </div>
      </div>

      {/* Habits Section */}
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            Daily Habits
          </h2>
          <button onClick={handleAddHabit} className="btn-secondary text-sm">
            <span className="text-lg">+</span>
          </button>
        </div>
        <HabitList
          habits={habits}
          completions={habitCompletions}
          onIncrement={handleIncrementHabit}
          onDecrement={handleDecrementHabit}
          onEdit={handleEditHabit}
          onDelete={handleDeleteHabit}
          onReorder={handleReorderHabits}
          editable={true}
        />
      </div>

      {/* Today's Study Tasks */}
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Today's Study Plan
          </h2>
          <button
            onClick={() => setView('schedule')}
            className="btn-secondary text-sm"
          >
            View Week
          </button>
        </div>
        {todayTasks.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No study tasks scheduled for today</p>
            <button
              onClick={() => setView('schedule')}
              className="btn-primary"
            >
              Add Tasks in Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map(task => {
              const isComplete = task.completed || taskCompletions.includes(task.id);
              return (
                <div key={task.id} className="card p-4 flex items-start gap-4">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`relative w-6 h-6 flex-shrink-0 mt-0.5 rounded border-2 transition-colors ${
                      isComplete ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isComplete && <CheckCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-medium truncate ${isComplete ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        {task.title}
                      </h3>
                      <span className={getCategoryColor(task.category)}>
                        {getNotificationIcon(task.category)} {task.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatDuration(task.durationMinutes)}</span>
                    </div>
                    {task.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{task.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* End Day Button */}
      {canEndDay && (
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <button
            onClick={() => setShowEndDayModal(true)}
            className="btn-primary w-full py-4 text-lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            End Day & Save Progress
          </button>
        </div>
      )}

      {todayCompletion && !canEndDay && (
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Day Completed!</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400">
              Completed at {format(new Date(todayCompletion.completedAt), 'HH:mm')} • {todayCompletion.mood ? '⭐'.repeat(todayCompletion.mood) : ''}
            </p>
            {todayCompletion.notes && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 italic">"{todayCompletion.notes}"</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 safe-area-inset-bottom">
        <div className="grid grid-cols-3 max-w-2xl mx-auto">
          <button
            onClick={() => setView('today')}
            className={`py-3 flex flex-col items-center gap-1 transition-colors ${
              view === 'today'
                ? 'text-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-xs">Today</span>
          </button>
          <button
            onClick={() => setView('schedule')}
            className={`py-3 flex flex-col items-center gap-1 transition-colors ${
              view === 'schedule'
                ? 'text-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Schedule</span>
          </button>
          <button
            onClick={() => setView('settings')}
            className={`py-3 flex flex-col items-center gap-1 transition-colors ${
              view === 'settings'
                ? 'text-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>

      {/* End Day Modal */}
      {showEndDayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md animate-slide-in">
            <h3 className="text-lg font-semibold mb-4">End of Day Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">How was your day?</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(m => (
                    <button
                      key={m}
                      onClick={() => setEndDayMood(m as 1|2|3|4|5)}
                      className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                        endDayMood === m
                          ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {'⭐'.repeat(m)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea
                  value={endDayNotes}
                  onChange={(e) => setEndDayNotes(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="What went well? What to improve?"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEndDayModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndDay}
                  className="btn-primary flex-1"
                >
                  Save & Complete Day
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {offline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 text-center py-1 text-sm z-50">
          You're offline. Changes will sync when reconnected.
        </div>
      )}
    </div>
  );
}