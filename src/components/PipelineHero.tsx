import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getDayNumber } from '../utils/date';
import { TodayCircularRing } from './TodayCircularRing';

interface PipelineHeroProps {
  currentDate: string;
  totalTasks: number;
  completedTasks: number;
  todayTasksCompleted: number;
  todayTasksTotal: number;
  todayEffortCompletedMinutes: number;
  todayEffortTotalMinutes: number;
  streakDays: number;
  totalStudyHours: number;
}

export const PipelineHero: React.FC<PipelineHeroProps> = ({
  currentDate,
  totalTasks,
  completedTasks,
  todayTasksCompleted,
  todayTasksTotal,
  todayEffortCompletedMinutes,
  todayEffortTotalMinutes,
  streakDays,
  totalStudyHours,
}) => {
  const currentDayNum = Math.min(61, Math.max(1, getDayNumber(currentDate)));
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const dayPercent = Math.round((currentDayNum / 61) * 100);

  return (
    <View style={styles.container}>
      {/* Title & Status */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Pipeline Progression</Text>
          <Text style={styles.subtitle}>
            Day {currentDayNum} of 61 • 60-Day GCP Journey
          </Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={colors.accentWarn} />
          <Text style={styles.streakText}>{streakDays}d Streak</Text>
        </View>
      </View>

      {/* Visual Pipeline Track */}
      <View style={styles.trackContainer}>
        <View style={styles.trackBackground}>
          <View style={[styles.trackFill, { width: `${dayPercent}%` }]} />
        </View>

        {/* Milestone markers along the pipeline */}
        <View style={styles.milestonesRow}>
          <View style={styles.milestoneItem}>
            <View style={[styles.milestoneDot, currentDayNum >= 1 && styles.milestoneDotActive]} />
            <Text style={styles.milestoneLabel}>Nov 1</Text>
          </View>
          <View style={styles.milestoneItem}>
            <View style={[styles.milestoneDot, currentDayNum >= 15 && styles.milestoneDotActive]} />
            <Text style={styles.milestoneLabel}>Day 15</Text>
          </View>
          <View style={styles.milestoneItem}>
            <View style={[styles.milestoneDot, currentDayNum >= 30 && styles.milestoneDotActive]} />
            <Text style={styles.milestoneLabel}>Midpoint (D30)</Text>
          </View>
          <View style={styles.milestoneItem}>
            <View style={[styles.milestoneDot, currentDayNum >= 45 && styles.milestoneDotActive]} />
            <Text style={styles.milestoneLabel}>Sprint (D45)</Text>
          </View>
          <View style={styles.milestoneItem}>
            <View style={[styles.milestoneDot, currentDayNum >= 61 && styles.milestoneDotActive]} />
            <Text style={styles.milestoneLabel}>Dec 31</Text>
          </View>
        </View>
      </View>

      {/* Hero Body: Circular Ring + Key Metrics */}
      <View style={styles.heroBody}>
        {/* Left: Circular Progress Ring based on Task Effort */}
        <View style={styles.ringWrapper}>
          <TodayCircularRing
            completedEffortMinutes={todayEffortCompletedMinutes}
            totalEffortMinutes={todayEffortTotalMinutes}
            completedTasksCount={todayTasksCompleted}
            totalTasksCount={todayTasksTotal}
            size={135}
            strokeWidth={11}
          />
        </View>

        {/* Right: Detailed Progress Stats */}
        <View style={styles.metricsColumn}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>TODAY'S CORE</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricBig}>{todayTasksCompleted}</Text>
              <Text style={styles.metricSub}>/{todayTasksTotal} Tasks</Text>
            </View>
            <Text style={styles.metricHint}>
              {todayTasksCompleted === todayTasksTotal && todayTasksTotal > 0
                ? 'All finished! 🎉'
                : `${Math.max(0, todayTasksTotal - todayTasksCompleted)} tasks remaining`}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>TOTAL CURRICULUM</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricBig}>{completedTasks}</Text>
              <Text style={styles.metricSub}>/{totalTasks}</Text>
              <View style={styles.pctPill}>
                <Text style={styles.pctPillText}>{overallPercent}%</Text>
              </View>
            </View>
            <Text style={styles.metricHint}>{totalStudyHours}h study logged</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSurface,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    color: colors.fgPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.fgMuted,
    fontSize: 12,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentWarnDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  streakText: {
    color: colors.accentWarn,
    fontSize: 12,
    fontWeight: '700',
  },
  trackContainer: {
    marginVertical: 8,
  },
  trackBackground: {
    height: 6,
    backgroundColor: colors.bgRaised,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors.accentFlow,
    borderRadius: 3,
  },
  milestonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
  },
  milestoneItem: {
    alignItems: 'center',
  },
  milestoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderDefault,
    marginBottom: 3,
  },
  milestoneDotActive: {
    backgroundColor: colors.accentFlow,
  },
  milestoneLabel: {
    color: colors.fgSubtle,
    fontSize: 9,
    fontWeight: '600',
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgRaised,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 4,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 12,
  },
  metricsColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  metricItem: {
    paddingVertical: 2,
  },
  metricLabel: {
    color: colors.fgSubtle,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  metricBig: {
    color: colors.fgPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  metricSub: {
    color: colors.fgMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  pctPill: {
    backgroundColor: colors.accentFlowDim,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  pctPillText: {
    color: colors.accentFlow,
    fontSize: 10,
    fontWeight: '800',
  },
  metricHint: {
    color: colors.fgMuted,
    fontSize: 11,
    marginTop: 1,
  },
  metricDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 6,
  },
});
