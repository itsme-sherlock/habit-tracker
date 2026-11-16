import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { colors } from '../theme/colors';

interface HabitSectionProps {
  habits: Habit[];
  habitCompletions: Record<string, number>;
  onUpdateCount: (habitId: string, delta: number) => void;
}

export const HabitSection: React.FC<HabitSectionProps> = ({
  habits,
  habitCompletions,
  onUpdateCount,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="repeat-outline" size={16} color={colors.accentFlow} />
          <Text style={styles.title}>Daily Micro-Habits</Text>
        </View>
        <Text style={styles.subtitle}>Daily consistency baseline</Text>
      </View>

      <View style={styles.habitList}>
        {habits.map((habit) => {
          const currentCount = habitCompletions[habit.id] || 0;
          const isDone = currentCount >= habit.targetCount;
          const progressPercent = Math.min(100, Math.round((currentCount / habit.targetCount) * 100));

          return (
            <View key={habit.id} style={styles.habitRow}>
              <View style={styles.habitMain}>
                <View style={styles.habitInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.habitName, isDone && styles.habitNameDone]}>
                      {habit.name}
                    </Text>
                    {isDone && (
                      <View style={styles.doneBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={colors.accentFlow} />
                      </View>
                    )}
                  </View>
                  {habit.description && (
                    <Text style={styles.habitDesc} numberOfLines={1}>
                      {habit.description}
                    </Text>
                  )}
                </View>

                {/* Inline Stepper */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={[styles.stepBtn, currentCount === 0 && styles.stepBtnDisabled]}
                    onPress={() => onUpdateCount(habit.id, -1)}
                    disabled={currentCount === 0}
                    activeOpacity={0.6}
                  >
                    <Ionicons
                      name="remove"
                      size={14}
                      color={currentCount === 0 ? colors.fgSubtle : colors.fgPrimary}
                    />
                  </TouchableOpacity>

                  <View style={styles.countDisplay}>
                    <Text style={styles.countText}>{currentCount}</Text>
                    <Text style={styles.unitText}>/{habit.targetCount} {habit.unit}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => onUpdateCount(habit.id, 1)}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="add" size={14} color={colors.accentFlow} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: isDone ? colors.accentFlow : colors.accentCalm,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: colors.fgPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.fgSubtle,
    fontSize: 11,
  },
  habitList: {
    gap: 12,
  },
  habitRow: {
    backgroundColor: colors.bgRaised,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  habitMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  habitInfo: {
    flex: 1,
    paddingRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitName: {
    color: colors.fgPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  habitNameDone: {
    color: colors.accentFlow,
  },
  doneBadge: {
    marginTop: 1,
  },
  habitDesc: {
    color: colors.fgMuted,
    fontSize: 11,
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: 2,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.bgRaised,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  countDisplay: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  countText: {
    color: colors.fgPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  unitText: {
    color: colors.fgSubtle,
    fontSize: 9,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.bgDeep,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
