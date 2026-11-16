import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/theme/colors';
import { StorageService } from './src/services/storage';
import { NotificationService } from './src/services/notifications';
import { StudyTask, Habit, DailyCompletion, AppSettings, DEFAULT_APP_SETTINGS } from './src/types';
import { getTodayDateString, getDayNumber, getPrevDate } from './src/utils/date';
import { TodayScreen } from './src/screens/TodayScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type TabType = 'today' | 'analytics' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Record<string, DailyCompletion>>({});
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [ready, setReady] = useState<boolean>(false);

  // Sync hourly notification reminder with latest pending task count
  const syncHourlyReminder = useCallback(
    (
      taskList: StudyTask[],
      habitList: Habit[],
      compMap: Record<string, DailyCompletion>,
      dateStr: string,
      currentSettings: AppSettings
    ) => {
      const isPushEnabled = currentSettings.notificationSettings?.pushEnabled ?? true;
      if (!isPushEnabled) return;

      const currentDayTasks = taskList.filter((t) => t.date === dateStr);
      const pendingCount = currentDayTasks.filter((t) => !t.completed).length;
      const dayComp = compMap[dateStr];
      const pendingHabits = habitList.filter(
        (h) => (dayComp?.habitCompletions?.[h.id] || 0) < h.targetCount
      ).length;
      const dayNum = Math.min(61, Math.max(1, getDayNumber(dateStr)));

      NotificationService.scheduleHourlyReminder(pendingCount, dayNum, pendingHabits);
    },
    []
  );

  // Load app state
  const loadData = useCallback(async () => {
    try {
      await StorageService.init();
      const [fetchedTasks, fetchedHabits, fetchedCompletions, fetchedSettings] = await Promise.all([
        StorageService.getTasks(),
        StorageService.getHabits(),
        StorageService.getCompletions(),
        StorageService.getSettings(),
      ]);

      setTasks(fetchedTasks);
      setHabits(fetchedHabits);
      setCompletions(fetchedCompletions);
      setSettings(fetchedSettings);

      // Auto-schedule hourly reminder for today
      syncHourlyReminder(fetchedTasks, fetchedHabits, fetchedCompletions, getTodayDateString(), fetchedSettings);
    } catch (e) {
      console.error('Error loading app data:', e);
    } finally {
      setReady(true);
    }
  }, [syncHourlyReminder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle main task completed
  const handleToggleTask = async (taskId: string) => {
    const updated = await StorageService.toggleTask(taskId);
    setTasks(updated);
    const updatedComps = await StorageService.getCompletions();
    setCompletions(updatedComps);

    // Re-schedule hourly reminder with new pending count
    syncHourlyReminder(updated, habits, updatedComps, currentDate, settings);
  };

  // Toggle individual submodule
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const updated = await StorageService.toggleSubtask(taskId, subtaskId);
    setTasks(updated);
    const updatedComps = await StorageService.getCompletions();
    setCompletions(updatedComps);

    // Re-schedule hourly reminder with new pending count
    syncHourlyReminder(updated, habits, updatedComps, currentDate, settings);
  };

  // Update habit stepper
  const handleUpdateHabit = async (habitId: string, delta: number) => {
    const updatedComp = await StorageService.updateHabitCount(habitId, delta, currentDate);
    const newComps = {
      ...completions,
      [currentDate]: updatedComp,
    };
    setCompletions(newComps);

    // Re-schedule hourly reminder with new habit count
    syncHourlyReminder(tasks, habits, newComps, currentDate, settings);
  };

  // Save notes and mood
  const handleSaveReflection = async (notes: string, mood?: 1 | 2 | 3 | 4 | 5) => {
    const updatedComp = await StorageService.saveDayReflection(currentDate, notes, mood);
    setCompletions((prev) => ({
      ...prev,
      [currentDate]: updatedComp,
    }));
  };

  // Update settings
  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    const updated = await StorageService.updateSettings(updates);
    setSettings(updated);
  };

  // Filter tasks for current date
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.date === currentDate);
  }, [tasks, currentDate]);

  // Current date completion
  const currentCompletion: DailyCompletion = useMemo(() => {
    return (
      completions[currentDate] || {
        date: currentDate,
        habitCompletions: {},
        taskCompletions: [],
        completedAt: Date.now(),
      }
    );
  }, [completions, currentDate]);

  // Calculate study hours and streak
  const { streakDays, totalStudyHours } = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed);
    const totalMinutes = completedTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
    const hours = Math.round(totalMinutes / 60);

    const completedDates = new Set<string>();
    completedTasks.forEach((t) => completedDates.add(t.date));

    Object.entries(completions).forEach(([d, c]) => {
      const hasHabitDone = Object.values(c.habitCompletions || {}).some((v) => v > 0);
      if (hasHabitDone) completedDates.add(d);
    });

    let streak = 0;
    let checkDateStr = currentDate;

    for (let i = 0; i < 61; i++) {
      if (completedDates.has(checkDateStr)) {
        streak++;
        checkDateStr = getPrevDate(checkDateStr);
      } else {
        if (i === 0) {
          checkDateStr = getPrevDate(checkDateStr);
          continue;
        }
        break;
      }
    }

    return { streakDays: streak, totalStudyHours: hours };
  }, [tasks, completions, currentDate]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="light" />

        <View style={styles.appWrapper}>
          <View style={styles.screenContainer}>
            {activeTab === 'today' && (
              <TodayScreen
                currentDate={currentDate}
                onSelectDate={setCurrentDate}
                tasks={todayTasks}
                allTasks={tasks}
                habits={habits}
                completion={currentCompletion}
                streakDays={streakDays}
                totalStudyHours={totalStudyHours}
                onToggleTask={handleToggleTask}
                onToggleSubtask={handleToggleSubtask}
                onUpdateHabit={handleUpdateHabit}
                onSaveReflection={handleSaveReflection}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsScreen
                tasks={tasks}
                habits={habits}
                completions={completions}
                streakDays={streakDays}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsScreen
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
          </View>

          {/* Bottom Navigation Bar: Clean 3-Tab Layout */}
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('today')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'today' ? 'today' : 'today-outline'}
                size={22}
                color={activeTab === 'today' ? colors.accentFlow : colors.fgSubtle}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'today' && styles.navLabelActive,
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('analytics')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'analytics' ? 'stats-chart' : 'stats-chart-outline'}
                size={22}
                color={activeTab === 'analytics' ? colors.accentFlow : colors.fgSubtle}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'analytics' && styles.navLabelActive,
                ]}
              >
                Analytics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('settings')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'settings' ? 'settings' : 'settings-outline'}
                size={22}
                color={activeTab === 'settings' ? colors.accentFlow : colors.fgSubtle}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'settings' && styles.navLabelActive,
                ]}
              >
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070C14',
    alignItems: 'center',
  },
  appWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    backgroundColor: colors.bgDeep,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 58,
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  navLabel: {
    color: colors.fgSubtle,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  navLabelActive: {
    color: colors.accentFlow,
    fontWeight: '800',
  },
});
