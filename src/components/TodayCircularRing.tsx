import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

interface TodayCircularRingProps {
  completedEffortMinutes: number;
  totalEffortMinutes: number;
  completedTasksCount: number;
  totalTasksCount: number;
  size?: number;
  strokeWidth?: number;
}

export const TodayCircularRing: React.FC<TodayCircularRingProps> = ({
  completedEffortMinutes,
  totalEffortMinutes,
  completedTasksCount,
  totalTasksCount,
  size = 145,
  strokeWidth = 12,
}) => {
  const percentage =
    totalEffortMinutes > 0 ? Math.min(1, completedEffortMinutes / totalEffortMinutes) : 0;
  const percentText = Math.round(percentage * 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - circumference * percentage;
  const isFullyComplete = percentText >= 100;

  // Format hours / minutes
  const completedHoursFormatted = (completedEffortMinutes / 60).toFixed(1).replace(/\.0$/, '');
  const totalHoursFormatted = (totalEffortMinutes / 60).toFixed(1).replace(/\.0$/, '');

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradEffort" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00D4AA" />
            <Stop offset="100%" stopColor="#3B82F6" />
          </LinearGradient>
        </Defs>

        {/* Background track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.bgRaised}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress fill circle based on task effort */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isFullyComplete ? colors.accentFlow : 'url(#ringGradEffort)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Inside Content */}
      <View style={styles.innerContent}>
        <Text style={[styles.percentNumber, isFullyComplete && styles.percentComplete]}>
          {percentText}%
        </Text>
        <Text style={styles.effortRatio}>
          {completedHoursFormatted}h / {totalHoursFormatted}h
        </Text>
        <Text style={styles.effortLabel}>EFFORT COMPLETED</Text>
        <View style={styles.tasksPill}>
          <Text style={styles.tasksPillText}>
            {completedTasksCount}/{totalTasksCount} Tasks
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentNumber: {
    color: colors.fgPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  percentComplete: {
    color: colors.accentFlow,
  },
  effortRatio: {
    color: colors.accentFlow,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
    letterSpacing: 0.3,
  },
  effortLabel: {
    color: colors.fgSubtle,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  tasksPill: {
    backgroundColor: colors.bgDeep,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 3,
  },
  tasksPillText: {
    color: colors.fgMuted,
    fontSize: 9,
    fontWeight: '600',
  },
});
