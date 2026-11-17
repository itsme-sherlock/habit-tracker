import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { StudyTask } from '../types';
import { getDayNumber, getTodayDateString, formatFriendlyDate } from '../utils/date';

interface CatchupRadarCardProps {
  currentDate: string;
  allTasks: StudyTask[];
  onSelectDate: (date: string) => void;
}

export const CatchupRadarCard: React.FC<CatchupRadarCardProps> = ({
  currentDate,
  allTasks,
  onSelectDate,
}) => {
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Compute backlog metrics
  const backlogStats = useMemo(() => {
    // Collect all past dates up to yesterday
    const pastTasks = allTasks.filter((t) => t.date < todayStr);

    // Group by date
    const dayMap = new Map<string, { total: number; done: number; tasks: StudyTask[] }>();
    pastTasks.forEach((t) => {
      const entry = dayMap.get(t.date) || { total: 0, done: 0, tasks: [] };
      entry.total += 1;
      entry.tasks.push(t);
      if (t.completed) entry.done += 1;
      dayMap.set(t.date, entry);
    });

    // Find missed days
    const missedDates: string[] = [];
    const overdueTasks: StudyTask[] = [];

    const sortedDates = Array.from(dayMap.keys()).sort();
    sortedDates.forEach((d) => {
      const entry = dayMap.get(d)!;
      if (entry.done < entry.total) {
        missedDates.push(d);
        overdueTasks.push(...entry.tasks.filter((t) => !t.completed));
      }
    });

    const firstMissedDate = missedDates[0] || null;
    const firstMissedDayNum = firstMissedDate ? getDayNumber(firstMissedDate) : null;

    return {
      isBehind: missedDates.length > 0,
      missedDaysCount: missedDates.length,
      overdueTasksCount: overdueTasks.length,
      firstMissedDate,
      firstMissedDayNum,
      priorityTasks: overdueTasks.slice(0, 3), // next 3 urgent backlog tasks
    };
  }, [allTasks, todayStr]);

  if (!backlogStats.isBehind) {
    return (
      <View style={styles.onTrackContainer}>
        <View style={styles.iconDotOnTrack} />
        <Ionicons name="shield-checkmark" size={15} color={colors.accentSuccess} />
        <Text style={styles.onTrackText}>
          Pace On Track • No overdue backlog
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.pulseDot} />
          <Ionicons name="speedometer-outline" size={16} color={colors.accentWarn} />
          <Text style={styles.title}>Catch-Up Radar & Backlog</Text>
        </View>
        <View style={styles.badgeWarn}>
          <Text style={styles.badgeWarnText}>
            {backlogStats.overdueTasksCount} OVERDUE
          </Text>
        </View>
      </View>

      <Text style={styles.summaryText}>
        You fell off track on{' '}
        <Text style={styles.highlightText}>
          Day {backlogStats.firstMissedDayNum} ({formatFriendlyDate(backlogStats.firstMissedDate!)})
        </Text>
        . You currently have{' '}
        <Text style={styles.highlightText}>
          {backlogStats.overdueTasksCount} incomplete tasks
        </Text>{' '}
        across {backlogStats.missedDaysCount} days.
      </Text>

      {/* Catch-Up Action */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => onSelectDate(backlogStats.firstMissedDate!)}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-redo" size={15} color="#0B1220" />
        <Text style={styles.actionBtnText}>
          Jump to Day {backlogStats.firstMissedDayNum} to Catch Up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentWarn,
  },
  title: {
    color: colors.fgPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  badgeWarn: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accentWarn,
  },
  badgeWarnText: {
    color: colors.accentWarn,
    fontSize: 9,
    fontWeight: '800',
  },
  summaryText: {
    color: colors.fgMuted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  highlightText: {
    color: colors.accentWarn,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentWarn,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#0B1220',
    fontSize: 12,
    fontWeight: '800',
  },
  onTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  iconDotOnTrack: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.accentSuccess,
  },
  onTrackText: {
    color: colors.accentSuccess,
    fontSize: 11,
    fontWeight: '700',
  },
});
