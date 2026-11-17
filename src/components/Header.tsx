import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getDayNumber, formatFriendlyDate, getNextDate, getPrevDate, getTodayDateString } from '../utils/date';

interface HeaderProps {
  currentDate: string;
  onSelectDate: (date: string) => void;
  onOpenCalendar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentDate, onSelectDate, onOpenCalendar }) => {
  const dayNum = getDayNumber(currentDate);
  const isToday = currentDate === getTodayDateString();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.pipelineDot} />
          <Text style={styles.brandTitle}>DE60</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>NOV 1 – DEC 31</Text>
          </View>
        </View>

        {!isToday && (
          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => onSelectDate(getTodayDateString())}
            activeOpacity={0.7}
          >
            <Ionicons name="flash-outline" size={13} color={colors.accentFlow} />
            <Text style={styles.todayButtonText}>Jump to Today</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navArrow}
          onPress={() => onSelectDate(getPrevDate(currentDate))}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.fgPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateCenterBtn}
          onPress={onOpenCalendar}
          activeOpacity={0.7}
        >
          <View style={styles.dateCenterRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.accentFlow} />
            <Text style={styles.dayLabel}>
              {dayNum > 0 && dayNum <= 61 ? `DAY ${dayNum} OF 61` : `PLAN SCHEDULE`}
            </Text>
          </View>
          <Text style={styles.dateString}>{formatFriendlyDate(currentDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navArrow}
          onPress={() => onSelectDate(getNextDate(currentDate))}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.fgPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pipelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accentFlow,
  },
  brandTitle: {
    color: colors.fgPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  planBadge: {
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  planBadgeText: {
    color: colors.accentWarn,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentFlowDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.3)',
  },
  todayButtonText: {
    color: colors.accentFlow,
    fontSize: 11,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgRaised,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  navArrow: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.bgSurface,
  },
  dateCenterBtn: {
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 212, 170, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.2)',
  },
  dateCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dayLabel: {
    color: colors.accentFlow,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  dateString: {
    color: colors.fgPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 1,
  },
});
