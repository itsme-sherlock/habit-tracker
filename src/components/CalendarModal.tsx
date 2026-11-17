import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { StudyTask, DailyCompletion } from '../types';
import { getDayNumber, getTodayDateString, formatFriendlyDate } from '../utils/date';
import { PLAN_START, PLAN_END } from '../data/gcpCurriculum';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  currentDate: string;
  onSelectDate: (date: string) => void;
  allTasks: StudyTask[];
  completions: Record<string, DailyCompletion>;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  currentDate,
  onSelectDate,
  allTasks,
  completions,
}) => {
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Parse current date to set initial calendar month/year
  const initialDateParts = useMemo(() => {
    const parts = (currentDate || todayStr).split('-');
    return {
      year: parseInt(parts[0], 10) || 2026,
      month: (parseInt(parts[1], 10) || 11) - 1, // 0-indexed
    };
  }, [currentDate, todayStr]);

  const [viewYear, setViewYear] = useState<number>(initialDateParts.year);
  const [viewMonth, setViewMonth] = useState<number>(initialDateParts.month);

  // Group tasks completion by date
  const dateStatusMap = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    allTasks.forEach((t) => {
      const entry = map.get(t.date) || { total: 0, done: 0 };
      entry.total += 1;
      if (t.completed) entry.done += 1;
      map.set(t.date, entry);
    });
    return map;
  }, [allTasks]);

  // Find the earliest missed day (past date with uncompleted tasks)
  const earliestMissedDate = useMemo(() => {
    const sortedDates = Array.from(dateStatusMap.keys()).sort();
    for (const d of sortedDates) {
      if (d < todayStr) {
        const stats = dateStatusMap.get(d);
        if (stats && stats.done < stats.total) {
          return d;
        }
      }
    }
    return null;
  }, [dateStatusMap, todayStr]);

  // Generate matrix of days for the current viewMonth
  const daysInMonth = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: ({ dayNum: number; dateStr: string } | null)[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }

    // Actual month days
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({
        dayNum: d,
        dateStr: `${viewYear}-${mStr}-${dStr}`,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.monthNav}>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={handlePrevMonth}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-back" size={18} color={colors.fgPrimary} />
                  </TouchableOpacity>

                  <Text style={styles.monthTitle}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </Text>

                  <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={handleNextMonth}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-forward" size={18} color={colors.fgPrimary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color={colors.fgSubtle} />
                </TouchableOpacity>
              </View>

              {/* Day of Week Row */}
              <View style={styles.weekdayRow}>
                {WEEKDAYS.map((w, idx) => (
                  <Text key={idx} style={styles.weekdayText}>
                    {w}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.grid}>
                {daysInMonth.map((cell, idx) => {
                  if (!cell) {
                    return <View key={`empty-${idx}`} style={styles.dayCellEmpty} />;
                  }

                  const { dayNum, dateStr } = cell;
                  const isSelected = dateStr === currentDate;
                  const isToday = dateStr === todayStr;
                  const planDay = getDayNumber(dateStr);
                  const inPlan = planDay >= 1 && planDay <= 61;

                  const stats = dateStatusMap.get(dateStr);
                  const isPast = dateStr < todayStr;
                  const isFullyDone = inPlan && stats && stats.total > 0 && stats.done === stats.total;
                  const isPartiallyDone = inPlan && stats && stats.done > 0 && stats.done < stats.total;
                  const isMissed = inPlan && isPast && (!stats || stats.done < stats.total);

                  return (
                    <TouchableOpacity
                      key={dateStr}
                      style={[
                        styles.dayCell,
                        inPlan && styles.dayCellInPlan,
                        isSelected && styles.dayCellSelected,
                        isToday && !isSelected && styles.dayCellToday,
                        isMissed && !isSelected && styles.dayCellMissed,
                      ]}
                      onPress={() => handleSelectDay(dateStr)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayNumText,
                          !inPlan && styles.dayNumTextMuted,
                          isToday && styles.dayNumTextToday,
                          isSelected && styles.dayNumTextSelected,
                          isMissed && styles.dayNumTextMissed,
                        ]}
                      >
                        {dayNum}
                      </Text>

                      {inPlan && (
                        <Text style={[styles.planBadgeText, isSelected && { color: '#0B1220' }]}>
                          D{planDay}
                        </Text>
                      )}

                      {/* Status Dot */}
                      {isFullyDone && <View style={styles.dotDone} />}
                      {isPartiallyDone && <View style={styles.dotPartial} />}
                      {isMissed && <View style={styles.dotMissed} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Status Legend */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accentSuccess }]} />
                  <Text style={styles.legendText}>Completed</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accentDanger }]} />
                  <Text style={styles.legendText}>Missed</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accentFlow }]} />
                  <Text style={styles.legendText}>Today</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accentPurple }]} />
                  <Text style={styles.legendText}>Selected</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                {earliestMissedDate && (
                  <TouchableOpacity
                    style={styles.catchupBtn}
                    onPress={() => handleSelectDay(earliestMissedDate)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="speedometer-outline" size={15} color={colors.accentWarn} />
                    <Text style={styles.catchupBtnText}>
                      Catch Up: Day {getDayNumber(earliestMissedDate)}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.todayBtn}
                  onPress={() => handleSelectDay(todayStr)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="flash-outline" size={15} color="#0B1220" />
                  <Text style={styles.todayBtnText}>Today</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 9, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.bgSurface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.bgRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  monthTitle: {
    color: colors.fgPrimary,
    fontSize: 15,
    fontWeight: '800',
    minWidth: 130,
    textAlign: 'center',
  },
  closeBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  weekdayText: {
    color: colors.fgSubtle,
    fontSize: 11,
    fontWeight: '700',
    width: 40,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCellEmpty: {
    width: 44,
    height: 48,
    marginVertical: 2,
  },
  dayCell: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
    position: 'relative',
  },
  dayCellInPlan: {
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  dayCellSelected: {
    backgroundColor: colors.accentFlow,
    borderColor: colors.accentFlow,
  },
  dayCellToday: {
    borderColor: colors.accentCalm,
    borderWidth: 1.5,
  },
  dayCellMissed: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  dayNumText: {
    color: colors.fgPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  dayNumTextMuted: {
    color: colors.fgSubtle,
    opacity: 0.4,
  },
  dayNumTextToday: {
    color: colors.accentCalm,
    fontWeight: '900',
  },
  dayNumTextSelected: {
    color: '#0B1220',
    fontWeight: '900',
  },
  dayNumTextMissed: {
    color: colors.accentDanger,
  },
  planBadgeText: {
    color: colors.fgSubtle,
    fontSize: 8,
    fontWeight: '800',
    marginTop: -1,
  },
  dotDone: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.accentSuccess,
    position: 'absolute',
    bottom: 3,
  },
  dotPartial: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.accentWarn,
    position: 'absolute',
    bottom: 3,
  },
  dotMissed: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.accentDanger,
    position: 'absolute',
    bottom: 3,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    color: colors.fgSubtle,
    fontSize: 10,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  catchupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    borderWidth: 1,
    borderColor: colors.accentWarn,
    paddingVertical: 9,
    borderRadius: 10,
  },
  catchupBtnText: {
    color: colors.accentWarn,
    fontSize: 12,
    fontWeight: '700',
  },
  todayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentFlow,
    paddingVertical: 9,
    borderRadius: 10,
  },
  todayBtnText: {
    color: '#0B1220',
    fontSize: 12,
    fontWeight: '800',
  },
});
