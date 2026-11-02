import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, Target, Calendar, ChevronLeft, ChevronRight, Sun, Moon, Settings, Download, RefreshCw, Monitor, Star, Plus } from 'lucide-react';
import { format, parseISO, addDays, isToday, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import type { Habit, StudyTask, DailyCompletion, AppSettings } from '../types';
import { HabitList } from './HabitList';
import { ScheduleEditor } from './ScheduleEditor';
import { SettingsComponent } from './Settings';
import { TaskCard } from './TaskCard';
import { TodayHero } from './TodayHero';
import { getCompletionForDate, saveDailyCompletion, getHabits, getTasksForDate, getSettings, saveSettings } from '../services/db';
import { useHabits } from '../hooks/useHabits';
import { useSchedule } from '../hooks/useSchedule';
import { useNotifications } from '../hooks/useNotifications';
import { usePWA } from '../hooks/usePWA';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { useTheme } from '../context/ThemeContext';

type View = 'today' | 'schedule' | 'settings';

function currentTimestamp(): number {
  return Date.now();
}

export function Dashboard() {
  const [view, setView] = useState<View>('today');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showEndDayModal, setShowEndDayModal] = useState(false);
  const [endDayNotes, setEndDayNotes] = useState('');
  const [endDayMood, setEndDayMood] = useState<1|2|3|4|5>(3);
  const [completion, setCompletion] = useState<DailyCompletion | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [habitSaveError, setHabitSaveError] = useState<string | null>(null);
  const completionRef = useRef<DailyCompletion | null>(null);
  const completionLoadIdRef = useRef(0);

  // Load app settings
  useEffect(() => {
    getSettings().then(setAppSettings);
  }, []);

  const { habits, loading: habitsLoading, createHabit, editHabit, removeHabit, moveHabit, refresh: refreshHabits } = useHabits();
  const { tasks, loading: tasksLoading, createTask, editTask, removeTask, toggleTaskComplete, getTasksForDate, loadTasksForDate, loadTasksForRange } = useSchedule();
  const { settings: notificationSettings, updateSettings, triggerTest } = useNotifications();
  const { installable, installed, install, updateAvailable, applyUpdate, offline } = usePWA();
  const cloudSync = useSupabaseSync();
  const signedInUserId = cloudSync.user?.id;
  const { theme, setTheme, resolvedTheme } = useTheme();

  const todayTasks = getTasksForDate(selectedDate);
  const todayCompletion = completion?.date === selectedDate ? completion : null;

  // Debug: Show task loading state
  const totalTasksLoaded = Object.values(tasks).flat().length;
  const curriculumStart = '2026-11-01';
  const curriculumEnd = '2027-03-01';
  const isDateInCurriculum = selectedDate >= curriculumStart && selectedDate <= curriculumEnd;

  // Load completion for selected date
  const loadCompletion = useCallback(async () => {
    const requestId = ++completionLoadIdRef.current;
    const date = selectedDate;
    const c = await getCompletionForDate(date);
    if (requestId !== completionLoadIdRef.current) return;
    completionRef.current = c || null;
    setCompletion(c);
  }, [selectedDate]);

  useEffect(() => {
    void loadCompletion();
  }, [loadCompletion]);

  useEffect(() => {
    if (!signedInUserId || !cloudSync.syncStatus.lastSyncTime) return;
    void refreshHabits();
    void loadTasksForRange('0000-01-01', '9999-12-31');
    void loadCompletion();
  }, [signedInUserId, cloudSync.syncStatus.lastSyncTime, refreshHabits, loadTasksForRange, loadCompletion]);

  const habitCompletions = todayCompletion?.habitCompletions || {};
  const taskCompletions = todayCompletion?.taskCompletions || [];

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => (habitCompletions[h.id] || 0) >= h.targetCount).length;
  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter(t => t.completed || taskCompletions.includes(t.id)).length;

  const overallProgress = totalHabits + totalTasks > 0
    ? Math.round(((completedHabits + completedTasks) / (totalHabits + totalTasks)) * 100)
    : 0;

  const updateHabitCompletion = (id: string, change: 1 | -1) => {
    const currentCompletion = completionRef.current?.date === selectedDate
      ? completionRef.current
      : null;
    const current = currentCompletion?.habitCompletions[id] || 0;
    const habit = habits.find(h => h.id === id);
    if (!habit || (change > 0 && current >= habit.targetCount) || (change < 0 && current <= 0)) return;

    const updated: DailyCompletion = {
      date: selectedDate,
      habitCompletions: { ...(currentCompletion?.habitCompletions || {}), [id]: current + change },
      taskCompletions: currentCompletion?.taskCompletions || [],
      completedAt: currentCompletion?.completedAt || currentTimestamp(),
      dayEnded: currentCompletion?.dayEnded ?? Boolean(currentCompletion),
      notes: currentCompletion?.notes,
      mood: currentCompletion?.mood,
    };
    completionRef.current = updated;
    setCompletion(updated);
    setHabitSaveError(null);
    saveDailyCompletion(updated).catch(error => {
      console.error('Failed to save habit progress:', error);
      setHabitSaveError('Could not save habit progress. Please try again.');
    });
  };

  const handleIncrementHabit = (id: string) => updateHabitCompletion(id, 1);
  const handleDecrementHabit = (id: string) => updateHabitCompletion(id, -1);

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
      completedAt: currentTimestamp(),
      mood: endDayMood,
      dayEnded: true,
    };
    await saveDailyCompletion(newCompletion);
    completionRef.current = newCompletion;
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
          account={cloudSync}
        />
      </div>
    );
  }

  // Today view
  const isTodaySelected = isToday(parseISO(selectedDate));
  const dayEnded = todayCompletion?.dayEnded ?? Boolean(todayCompletion);
  const canEndDay = isTodaySelected && !dayEnded;

  return (
    <div className="dashboard-page min-h-screen pb-20">
      {/* Header */}
      <header className="dashboard-header sticky top-0 z-40 backdrop-blur-sm border-b">
        <div className="dashboard-header-inner max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="dashboard-brand">
            <span className="dashboard-brand-symbol" aria-hidden="true">d</span>
            <span>Daymark</span>
          </div>
          <div className="dashboard-date-controls flex items-center gap-3">
            <button
              onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate), -1), 'yyyy-MM-dd'))}
              className="icon-button"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="dashboard-date-copy">
              <div className="text-sm text-muted">
                {format(parseISO(selectedDate), 'EEEE, MMM d')}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {isTodaySelected ? 'Today' : format(parseISO(selectedDate), 'yyyy-MM-dd')}
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}
              className="icon-button"
              aria-label="Next day"
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
              className="icon-button"
              title={`Current: ${theme} (click to cycle)`}
              aria-label={`Theme: ${theme}. Activate to change`}
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

      {/* Debug Panel */}
      <div className="mx-4 mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs">
        <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Debug Info</div>
        <div className="grid grid-cols-2 gap-2 text-gray-700 dark:text-gray-300">
          <div>Selected Date: <span className="font-mono">{selectedDate}</span></div>
          <div>Today: <span className="font-mono">{isTodaySelected ? 'Yes' : 'No'}</span></div>
          <div>In Curriculum Range: <span className="font-mono">{isDateInCurriculum ? 'Yes' : 'No'}</span></div>
          <div>Curriculum Range: <span className="font-mono">{curriculumStart} to {curriculumEnd}</span></div>
          <div>Total Tasks Loaded: <span className="font-mono">{totalTasksLoaded}</span></div>
          <div>Tasks for Selected Date: <span className="font-mono">{todayTasks.length}</span></div>
          <div>Tasks Loading: <span className="font-mono">{tasksLoading ? 'Yes' : 'No'}</span></div>
          <div>Habits Loading: <span className="font-mono">{habitsLoading ? 'Yes' : 'No'}</span></div>
        </div>
        {!isDateInCurriculum && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
            ⚠️ Selected date is outside the curriculum range ({curriculumStart} - {curriculumEnd}).
            Use the date navigation arrows to select a date within the curriculum.
          </div>
        )}
        {tasksLoading && (
          <div className="mt-2 text-blue-700 dark:text-blue-300">Loading tasks...</div>
        )}
      </div>

      {/* Progress Ring */}
      <div className="dashboard-overview-wrap">
        <TodayHero
          selectedDate={selectedDate}
          overallProgress={overallProgress}
          completedHabits={completedHabits}
          totalHabits={totalHabits}
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          studiedMinutes={todayTasks.reduce((sum, t) => sum + (t.completed || taskCompletions.includes(t.id) ? t.durationMinutes : 0), 0)}
          plannedMinutes={todayTasks.reduce((sum, t) => sum + t.durationMinutes, 0)}
        />
      </div>

      {/* Habits Section */}
      <div className="dashboard-habits-wrap">
        <div className="dashboard-section-heading flex items-center justify-between mb-3">
          <h2 className="font-semibold text-strong flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" aria-hidden="true" />
            Daily Habits
          </h2>
          <button onClick={handleAddHabit} className="icon-button" aria-label="Add habit">
            <Plus className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        {habitSaveError && (
          <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
            {habitSaveError}
          </p>
        )}
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
      <div className="dashboard-plan-wrap">
        <div className="dashboard-section-heading flex items-center justify-between mb-3">
          <h2 className="font-semibold text-strong flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" aria-hidden="true" />
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
            {todayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isComplete={task.completed || taskCompletions.includes(task.id)}
                onToggle={() => handleToggleTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* End Day Button */}
      {canEndDay && (
        <div className="dashboard-endday-wrap">
          <button
            onClick={() => setShowEndDayModal(true)}
            className="btn-primary w-full py-4 text-lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            End Day & Save Progress
          </button>
        </div>
      )}

      {todayCompletion && dayEnded && (
        <div className="dashboard-completed-wrap">
          <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Day Completed!</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400">
              Completed at {format(new Date(todayCompletion.completedAt), 'HH:mm')}{todayCompletion.mood ? ` • ${todayCompletion.mood}/5 mood` : ''}
            </p>
            {todayCompletion.notes && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 italic">"{todayCompletion.notes}"</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav aria-label="Primary" className="fixed bottom-0 left-0 right-0 backdrop-blur-sm border-t safe-area-inset-bottom" style={{ background: 'color-mix(in srgb, var(--surface) 94%, transparent)', borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-3 max-w-2xl mx-auto">
          {([
            ['today', 'Today', Sun],
            ['schedule', 'Schedule', Calendar],
            ['settings', 'Settings', Settings],
          ] as const).map(([key, label, NavIcon]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              aria-current={view === key ? 'page' : undefined}
              className={`min-h-[56px] py-2 flex flex-col items-center justify-center gap-1 transition-colors ${view === key ? 'text-accent font-semibold' : 'text-muted'}`}
            >
              <NavIcon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
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
                              <span className="sr-only">{m} star{m > 1 ? 's' : ''}</span>
                      <span aria-hidden="true" className="inline-flex justify-center">
                        {Array.from({ length: m }, (_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </span>
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