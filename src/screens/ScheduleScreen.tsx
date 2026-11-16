import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudyTask } from '../types';
import { colors } from '../theme/colors';
import { getDayNumber, formatFriendlyDate } from '../utils/date';
import { TaskCard } from '../components/TaskCard';

interface ScheduleScreenProps {
  tasks: StudyTask[];
  onToggleTask: (taskId: string) => void;
  onSelectDate: (date: string) => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  tasks,
  onToggleTask,
  onSelectDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Group tasks by date
  const groupedDays = useMemo(() => {
    const map = new Map<string, StudyTask[]>();
    tasks.forEach((t) => {
      const arr = map.get(t.date) || [];
      arr.push(t);
      map.set(t.date, arr);
    });

    // Convert to sorted array
    const sorted = Array.from(map.entries())
      .map(([date, dayTasks]) => {
        const dayNum = getDayNumber(date);
        const weekNum = Math.ceil(dayNum / 7);
        const doneCount = dayTasks.filter((t) => t.completed).length;
        return {
          date,
          dayNum,
          weekNum,
          tasks: dayTasks,
          doneCount,
          totalCount: dayTasks.length,
          allDone: doneCount === dayTasks.length && dayTasks.length > 0,
        };
      })
      .sort((a, b) => a.dayNum - b.dayNum);

    return sorted;
  }, [tasks]);

  // Filter based on search and week
  const filteredDays = useMemo(() => {
    return groupedDays.filter((day) => {
      if (selectedWeek !== null && day.weekNum !== selectedWeek) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesDate = day.date.toLowerCase().includes(q);
        const matchesTasks = day.tasks.some(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q))
        );
        return matchesDate || matchesTasks;
      }
      return true;
    });
  }, [groupedDays, selectedWeek, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Search & Header */}
      <View style={styles.header}>
        <Text style={styles.title}>60-Day Curriculum</Text>
        <Text style={styles.subtitle}>
          Full syllabus from Nov 1 to Dec 31 • 183 total tasks
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.fgMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search BigQuery, Dataflow, SQL, Kafka, IAM..."
            placeholderTextColor={colors.fgSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.fgMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Week Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekFilters}
        >
          <TouchableOpacity
            style={[styles.weekPill, selectedWeek === null && styles.weekPillActive]}
            onPress={() => setSelectedWeek(null)}
          >
            <Text
              style={[
                styles.weekPillText,
                selectedWeek === null && styles.weekPillTextActive,
              ]}
            >
              All Weeks
            </Text>
          </TouchableOpacity>

          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
            <TouchableOpacity
              key={w}
              style={[styles.weekPill, selectedWeek === w && styles.weekPillActive]}
              onPress={() => setSelectedWeek(selectedWeek === w ? null : w)}
            >
              <Text
                style={[
                  styles.weekPillText,
                  selectedWeek === w && styles.weekPillTextActive,
                ]}
              >
                W{w}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Days List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredDays.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={32} color={colors.fgSubtle} />
            <Text style={styles.emptyText}>No matching days or topics found</Text>
          </View>
        ) : (
          filteredDays.map((day) => {
            const isExpanded = expandedDay === day.date;

            return (
              <View key={day.date} style={styles.dayCard}>
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => setExpandedDay(isExpanded ? null : day.date)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dayInfo}>
                    <View style={styles.dayBadgeRow}>
                      <View style={styles.dayNumberBadge}>
                        <Text style={styles.dayNumberText}>DAY {day.dayNum}</Text>
                      </View>
                      <Text style={styles.weekLabel}>W{day.weekNum}</Text>
                    </View>
                    <Text style={styles.dayDateString}>
                      {formatFriendlyDate(day.date)}
                    </Text>
                  </View>

                  <View style={styles.dayRight}>
                    <View
                      style={[
                        styles.progressBadge,
                        day.allDone && styles.progressBadgeDone,
                      ]}
                    >
                      {day.allDone && (
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color="#0B1220"
                          style={{ marginRight: 2 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.progressText,
                          day.allDone && styles.progressTextDone,
                        ]}
                      >
                        {day.doneCount}/{day.totalCount}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.jumpBtn}
                      onPress={() => onSelectDate(day.date)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.jumpBtnText}>Open</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={12}
                        color={colors.accentFlow}
                      />
                    </TouchableOpacity>

                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.fgMuted}
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded Tasks */}
                {isExpanded && (
                  <View style={styles.dayExpandedTasks}>
                    {day.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={onToggleTask}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
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
    paddingBottom: 10,
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
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgRaised,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.fgPrimary,
    fontSize: 13,
    padding: 0,
  },
  weekFilters: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 4,
  },
  weekPill: {
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  weekPillActive: {
    backgroundColor: colors.accentFlowDim,
    borderColor: colors.accentFlow,
  },
  weekPillText: {
    color: colors.fgMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  weekPillTextActive: {
    color: colors.accentFlow,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  dayCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  dayInfo: {
    flex: 1,
  },
  dayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dayNumberBadge: {
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  dayNumberText: {
    color: colors.accentFlow,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  weekLabel: {
    color: colors.fgSubtle,
    fontSize: 10,
    fontWeight: '600',
  },
  dayDateString: {
    color: colors.fgPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  progressBadgeDone: {
    backgroundColor: colors.accentFlow,
    borderColor: colors.accentFlow,
  },
  progressText: {
    color: colors.fgMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  progressTextDone: {
    color: '#0B1220',
  },
  jumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.accentFlowDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  jumpBtnText: {
    color: colors.accentFlow,
    fontSize: 11,
    fontWeight: '700',
  },
  dayExpandedTasks: {
    backgroundColor: colors.bgDeep,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    color: colors.fgMuted,
    fontSize: 13,
  },
});
