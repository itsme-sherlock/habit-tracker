import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudyTask, Habit, DailyCompletion } from '../types';
import { colors } from '../theme/colors';
import { getDayNumber } from '../utils/date';

interface AnalyticsScreenProps {
  tasks: StudyTask[];
  habits: Habit[];
  completions: Record<string, DailyCompletion>;
  streakDays: number;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  tasks,
  habits,
  completions,
  streakDays,
}) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // By category
    const studyTasks = tasks.filter((t) => t.category === 'study');
    const practiceTasks = tasks.filter((t) => t.category === 'practice');
    const reviewTasks = tasks.filter((t) => t.category === 'review' || t.category === 'mock-exam');

    const studyDone = studyTasks.filter((t) => t.completed).length;
    const practiceDone = practiceTasks.filter((t) => t.completed).length;
    const reviewDone = reviewTasks.filter((t) => t.completed).length;

    // Study minutes calculated from completed tasks
    const taskMinutes = tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
    const studyHours = Math.round(taskMinutes / 60);

    // Readiness score calculation
    // 70% based on curriculum tasks completion, 30% on habits
    const readinessScore = Math.min(100, Math.round(overallPct * 0.85 + (streakDays > 0 ? 15 : 0)));

    // Generate day status map for all 61 days
    const dayMap = new Map<string, { done: number; total: number }>();
    tasks.forEach((t) => {
      const cur = dayMap.get(t.date) || { done: 0, total: 0 };
      cur.total += 1;
      if (t.completed) cur.done += 1;
      dayMap.set(t.date, cur);
    });

    const dayCells = Array.from(dayMap.entries())
      .map(([date, d]) => ({
        date,
        dayNum: getDayNumber(date),
        done: d.done,
        total: d.total,
        status: d.done === d.total && d.total > 0 ? 'full' : d.done > 0 ? 'partial' : 'none',
      }))
      .sort((a, b) => a.dayNum - b.dayNum);

    return {
      total,
      completed,
      overallPct,
      studyTasks: { total: studyTasks.length, done: studyDone },
      practiceTasks: { total: practiceTasks.length, done: practiceDone },
      reviewTasks: { total: reviewTasks.length, done: reviewDone },
      studyHours,
      readinessScore,
      dayCells,
    };
  }, [tasks, completions, streakDays]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Observability & Analytics</Text>
        <Text style={styles.subtitle}>
          Learning pipeline throughput, readiness & telemetry
        </Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Readiness Card */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessTop}>
            <View>
              <Text style={styles.cardHeaderSmall}>EXAM READINESS SCORE</Text>
              <Text style={styles.readinessValue}>{stats.readinessScore}%</Text>
              <Text style={styles.readinessSub}>
                {stats.readinessScore >= 80
                  ? 'Ready for GCP Exam certification'
                  : stats.readinessScore >= 40
                  ? 'Consistent progress, keep pushing labs'
                  : 'Early pipeline build phase'}
              </Text>
            </View>

            <View style={styles.streakBox}>
              <Ionicons name="flame" size={24} color={colors.accentWarn} />
              <Text style={styles.streakBig}>{streakDays}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>

          <View style={styles.readinessTrack}>
            <View
              style={[
                styles.readinessFill,
                {
                  width: `${stats.readinessScore}%`,
                  backgroundColor:
                    stats.readinessScore >= 70
                      ? colors.accentFlow
                      : stats.readinessScore >= 40
                      ? colors.accentWarn
                      : colors.accentCalm,
                },
              ]}
            />
          </View>
        </View>

        {/* 60-Day Pipeline Heatmap Grid */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="grid-outline" size={16} color={colors.accentFlow} />
            <Text style={styles.sectionHeading}>60-Day Pipeline Grid</Text>
          </View>
          <Text style={styles.sectionSubtext}>
            Nov 1 to Dec 31 day-by-day task execution
          </Text>

          <View style={styles.gridContainer}>
            {stats.dayCells.map((day) => {
              const bg =
                day.status === 'full'
                  ? colors.accentFlow
                  : day.status === 'partial'
                  ? colors.accentCalm
                  : colors.bgRaised;

              return (
                <View
                  key={day.date}
                  style={[
                    styles.gridCell,
                    { backgroundColor: bg },
                    day.status === 'full' && styles.gridCellFull,
                  ]}
                >
                  <Text
                    style={[
                      styles.gridCellText,
                      day.status === 'full' && { color: '#0B1220', fontWeight: '800' },
                    ]}
                  >
                    {day.dayNum}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: colors.accentFlow }]} />
              <Text style={styles.legendLabel}>All 3 Done</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: colors.accentCalm }]} />
              <Text style={styles.legendLabel}>Partial</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: colors.bgRaised }]} />
              <Text style={styles.legendLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="pie-chart-outline" size={16} color={colors.accentWarn} />
            <Text style={styles.sectionHeading}>Throughput by Category</Text>
          </View>

          {/* Learn / Study */}
          <View style={styles.categoryRow}>
            <View style={styles.catLeft}>
              <View style={[styles.catDot, { backgroundColor: colors.accentCalm }]} />
              <Text style={styles.catName}>Learn (Concepts & Architecture)</Text>
            </View>
            <Text style={styles.catCount}>
              {stats.studyTasks.done} / {stats.studyTasks.total}
            </Text>
          </View>
          <View style={styles.catTrack}>
            <View
              style={[
                styles.catFill,
                {
                  width: `${
                    stats.studyTasks.total > 0
                      ? (stats.studyTasks.done / stats.studyTasks.total) * 100
                      : 0
                  }%`,
                  backgroundColor: colors.accentCalm,
                },
              ]}
            />
          </View>

          {/* Hands-on / Practice */}
          <View style={[styles.categoryRow, { marginTop: 12 }]}>
            <View style={styles.catLeft}>
              <View style={[styles.catDot, { backgroundColor: colors.accentFlow }]} />
              <Text style={styles.catName}>Hands-On Labs & Builds</Text>
            </View>
            <Text style={styles.catCount}>
              {stats.practiceTasks.done} / {stats.practiceTasks.total}
            </Text>
          </View>
          <View style={styles.catTrack}>
            <View
              style={[
                styles.catFill,
                {
                  width: `${
                    stats.practiceTasks.total > 0
                      ? (stats.practiceTasks.done / stats.practiceTasks.total) * 100
                      : 0
                  }%`,
                  backgroundColor: colors.accentFlow,
                },
              ]}
            />
          </View>

          {/* Drills / Review */}
          <View style={[styles.categoryRow, { marginTop: 12 }]}>
            <View style={styles.catLeft}>
              <View style={[styles.catDot, { backgroundColor: colors.accentWarn }]} />
              <Text style={styles.catName}>Python + SQL + Interview Drills</Text>
            </View>
            <Text style={styles.catCount}>
              {stats.reviewTasks.done} / {stats.reviewTasks.total}
            </Text>
          </View>
          <View style={styles.catTrack}>
            <View
              style={[
                styles.catFill,
                {
                  width: `${
                    stats.reviewTasks.total > 0
                      ? (stats.reviewTasks.done / stats.reviewTasks.total) * 100
                      : 0
                  }%`,
                  backgroundColor: colors.accentWarn,
                },
              ]}
            />
          </View>
        </View>

        {/* Total stats summary grid */}
        <View style={styles.statsSummaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{stats.studyHours}h</Text>
            <Text style={styles.summaryLabel}>Total Focus Logged</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{stats.completed}</Text>
            <Text style={styles.summaryLabel}>Tasks Completed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{stats.total - stats.completed}</Text>
            <Text style={styles.summaryLabel}>Tasks Remaining</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  header: {
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  title: {
    color: colors.fgPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.fgMuted,
    fontSize: 12,
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  readinessCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
  },
  readinessTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardHeaderSmall: {
    color: colors.fgSubtle,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  readinessValue: {
    color: colors.accentFlow,
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 2,
  },
  readinessSub: {
    color: colors.fgMuted,
    fontSize: 12,
    maxWidth: 200,
  },
  streakBox: {
    alignItems: 'center',
    backgroundColor: colors.bgRaised,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  streakBig: {
    color: colors.accentWarn,
    fontSize: 20,
    fontWeight: '900',
  },
  streakLabel: {
    color: colors.fgSubtle,
    fontSize: 9,
    fontWeight: '600',
  },
  readinessTrack: {
    height: 8,
    backgroundColor: colors.bgRaised,
    borderRadius: 4,
    overflow: 'hidden',
  },
  readinessFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionBox: {
    backgroundColor: colors.bgSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    color: colors.fgPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtext: {
    color: colors.fgMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  gridCell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCellFull: {
    shadowColor: colors.accentFlow,
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gridCellText: {
    color: colors.fgMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    color: colors.fgMuted,
    fontSize: 11,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catName: {
    color: colors.fgPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  catCount: {
    color: colors.fgMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  catTrack: {
    height: 6,
    backgroundColor: colors.bgRaised,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsSummaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  summaryNum: {
    color: colors.fgPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  summaryLabel: {
    color: colors.fgSubtle,
    fontSize: 10,
    textAlign: 'center',
  },
});
