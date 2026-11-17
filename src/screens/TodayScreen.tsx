import React, { useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudyTask, Habit, DailyCompletion } from '../types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { PipelineHero } from '../components/PipelineHero';
import { TaskCard } from '../components/TaskCard';
import { HabitSection } from '../components/HabitSection';
import { DayReflection } from '../components/DayReflection';
import { CalendarModal } from '../components/CalendarModal';
import { CatchupRadarCard } from '../components/CatchupRadarCard';
import { getPrevDate, getNextDate, getDayNumber } from '../utils/date';
import { getTaskCompletedEffort } from '../utils/submodules';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TodayScreenProps {
  currentDate: string;
  onSelectDate: (date: string) => void;
  tasks: StudyTask[];
  allTasks: StudyTask[];
  habits: Habit[];
  completion: DailyCompletion;
  streakDays: number;
  totalStudyHours: number;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateHabit: (habitId: string, delta: number) => void;
  onSaveReflection: (notes: string, mood?: 1 | 2 | 3 | 4 | 5) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  currentDate,
  onSelectDate,
  tasks,
  allTasks,
  habits,
  completion,
  streakDays,
  totalStudyHours,
  onToggleTask,
  onToggleSubtask,
  onUpdateHabit,
  onSaveReflection,
}) => {
  const completedAllTasksCount = allTasks.filter((t) => t.completed).length;
  const todayTasksCompletedCount = tasks.filter((t) => t.completed).length;
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);

  // Calculate effort in minutes based on tasks and submodules
  const totalEffortMinutes = tasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const completedEffortMinutes = tasks.reduce((sum, t) => sum + getTaskCompletedEffort(t), 0);

  const currentDayNum = Math.min(61, Math.max(1, getDayNumber(currentDate)));

  // Keep references to prevent stale closures and prevent PanResponder recreation
  const currentDateRef = useRef(currentDate);
  currentDateRef.current = currentDate;

  const onSelectDateRef = useRef(onSelectDate);
  onSelectDateRef.current = onSelectDate;

  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const isSwiping = useRef(false);

  // Transition to NEXT DAY (Future) — triggered by Left Swipe (dx < 0)
  const transitionToNextDay = () => {
    if (isSwiping.current) return;
    isSwiping.current = true;

    // Slide current screen out to the left
    Animated.timing(translateX, {
      toValue: -SCREEN_WIDTH,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      // Exactly +1 day
      const nextDate = getNextDate(currentDateRef.current);
      onSelectDateRef.current(nextDate);

      // Prepare new day coming from right
      translateX.setValue(SCREEN_WIDTH * 0.9);
      Animated.spring(translateX, {
        toValue: 0,
        bounciness: 4,
        speed: 16,
        useNativeDriver: true,
      }).start(() => {
        isSwiping.current = false;
      });
    });
  };

  // Transition to PREVIOUS DAY (Past) — triggered by Right Swipe (dx > 0)
  const transitionToPrevDay = () => {
    if (isSwiping.current) return;
    isSwiping.current = true;

    // Slide current screen out to the right
    Animated.timing(translateX, {
      toValue: SCREEN_WIDTH,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      // Exactly -1 day
      const prevDate = getPrevDate(currentDateRef.current);
      onSelectDateRef.current(prevDate);

      // Prepare new day coming from left
      translateX.setValue(-SCREEN_WIDTH * 0.9);
      Animated.spring(translateX, {
        toValue: 0,
        bounciness: 4,
        speed: 16,
        useNativeDriver: true,
      }).start(() => {
        isSwiping.current = false;
      });
    });
  };

  // PanResponder created ONCE so it never resets or double-fires during state updates
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (isSwiping.current) return false;
          // Claim touch if horizontal swipe is dominant over vertical
          return (
            Math.abs(gestureState.dx) > 15 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2
          );
        },
        onPanResponderMove: (_, gestureState) => {
          if (!isSwiping.current) {
            // Live physical movement so user sees animation while dragging finger
            translateX.setValue(gestureState.dx * 0.75);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (isSwiping.current) return;
          const { dx, vx } = gestureState;

          if (dx < -45 || vx < -0.3) {
            // SWIPE LEFT: Advance to NEXT/FUTURE DAY
            transitionToNextDay();
          } else if (dx > 45 || vx > 0.3) {
            // SWIPE RIGHT: Go back to PREVIOUS/PAST DAY
            transitionToPrevDay();
          } else {
            // Incomplete swipe -> spring back to center
            Animated.spring(translateX, {
              toValue: 0,
              bounciness: 6,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start(() => {
            isSwiping.current = false;
          });
        },
      }),
    [] // Empty dependency array ensures permanent singleton listener
  );

  const opacity = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.6, 0, SCREEN_WIDTH * 0.6],
    outputRange: [0.7, 1, 0.7],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Header
        currentDate={currentDate}
        onSelectDate={onSelectDate}
        onOpenCalendar={() => setCalendarVisible(true)}
      />

      {/* Interactive Navigation Bar with Directional Buttons */}
      <View style={styles.navActionBar}>
        <TouchableOpacity
          style={styles.navActionBtn}
          onPress={transitionToPrevDay}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={15} color={colors.accentFlow} />
          <Text style={styles.navActionText}>Prev Day</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCenterBadge}
          onPress={() => setCalendarVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={12} color={colors.accentFlow} style={{ marginRight: 4 }} />
          <Text style={styles.navCenterText}>DAY {currentDayNum} OF 61</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navActionBtn}
          onPress={transitionToNextDay}
          activeOpacity={0.7}
        >
          <Text style={styles.navActionText}>Next Day</Text>
          <Ionicons name="chevron-forward" size={15} color={colors.accentFlow} />
        </TouchableOpacity>
      </View>

      {/* Animated container that translates live with the swipe */}
      <Animated.View
        style={[
          styles.animatedContent,
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pipeline Hero with Circular Progress Ring based on Task Effort */}
          <PipelineHero
            currentDate={currentDate}
            totalTasks={allTasks.length}
            completedTasks={completedAllTasksCount}
            todayTasksCompleted={todayTasksCompletedCount}
            todayTasksTotal={tasks.length}
            todayEffortCompletedMinutes={completedEffortMinutes}
            todayEffortTotalMinutes={totalEffortMinutes}
            streakDays={streakDays}
            totalStudyHours={totalStudyHours}
          />

          {/* Catch-Up Radar & Backlog Tracker */}
          <CatchupRadarCard
            currentDate={currentDate}
            allTasks={allTasks}
            onSelectDate={onSelectDate}
          />

          {/* Today's Tasks Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="layers-outline" size={17} color={colors.accentFlow} />
              <Text style={styles.sectionTitle}>Curriculum Pipeline</Text>
              <View style={styles.taskCountBadge}>
                <Text style={styles.taskCountText}>
                  {todayTasksCompletedCount}/{tasks.length} Done
                </Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              Core tasks scheduled for this day
            </Text>
          </View>

          {tasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={32} color={colors.fgSubtle} />
              <Text style={styles.emptyTitle}>No scheduled tasks</Text>
              <Text style={styles.emptyDesc}>
                This date is outside the 60-day study plan (Nov 1 - Dec 31).
              </Text>
            </View>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onToggleSubtask={onToggleSubtask}
              />
            ))
          )}

          {/* Daily Habits Section */}
          <HabitSection
            habits={habits}
            habitCompletions={completion.habitCompletions || {}}
            onUpdateCount={onUpdateHabit}
          />

          {/* Day Reflection & Mood */}
          <DayReflection
            initialNotes={completion.notes}
            initialMood={completion.mood}
            onSave={onSaveReflection}
          />
        </ScrollView>
      </Animated.View>

      {/* Calendar Picker Modal */}
      <CalendarModal
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        currentDate={currentDate}
        onSelectDate={onSelectDate}
        allTasks={allTasks}
        completions={completion ? { [currentDate]: completion } : {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  navActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  navActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  navActionText: {
    color: colors.fgPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  navCenterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgDeep,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  navCenterText: {
    color: colors.accentFlow,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  animatedContent: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: colors.fgPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  taskCountBadge: {
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  taskCountText: {
    color: colors.accentFlow,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.fgMuted,
    fontSize: 12,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginVertical: 12,
  },
  emptyTitle: {
    color: colors.fgPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyDesc: {
    color: colors.fgMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
