import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { StudyTask } from '../types';
import { colors } from '../theme/colors';
import { formatDuration } from '../utils/date';
import { getTaskResources, TaskResource } from '../data/resources';
import { getTaskSubmodules } from '../utils/submodules';

interface TaskCardProps {
  task: StudyTask;
  onToggle: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onToggleSubtask }) => {
  const [expanded, setExpanded] = useState(false);
  const resources: TaskResource[] = getTaskResources(task);
  const submodules = getTaskSubmodules(task);
  const doneSubmodulesCount = submodules.filter((s) => s.completed).length;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'study':
        return colors.accentCalm;
      case 'practice':
        return colors.accentFlow;
      case 'review':
        return colors.accentWarn;
      default:
        return colors.accentPurple;
    }
  };

  const getCategoryBadgeLabel = (cat: string) => {
    switch (cat) {
      case 'study':
        return 'LEARN';
      case 'practice':
        return 'HANDS-ON';
      case 'review':
        return 'DRILLS & INTERVIEW';
      default:
        return cat.toUpperCase();
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'study':
        return 'book-outline';
      case 'practice':
        return 'code-slash-outline';
      case 'review':
        return 'terminal-outline';
      default:
        return 'checkmark-circle-outline';
    }
  };

  const catColor = getCategoryColor(task.category);

  const handleOpenUrl = (url: string) => {
    try {
      Linking.openURL(url);
    } catch (e) {
      console.warn('Could not open url:', url);
    }
  };

  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: catColor },
        task.completed && styles.cardCompleted,
      ]}
    >
      <View style={styles.cardMain}>
        {/* Main Task Checkbox */}
        <TouchableOpacity
          style={[
            styles.checkbox,
            task.completed && { backgroundColor: colors.accentFlow, borderColor: colors.accentFlow },
          ]}
          onPress={() => onToggle(task.id)}
          activeOpacity={0.7}
        >
          {task.completed && <Ionicons name="checkmark" size={16} color="#0B1220" />}
        </TouchableOpacity>

        {/* Task Info */}
        <View style={styles.textContainer}>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: `${catColor}20`, borderColor: `${catColor}50` }]}>
              <Ionicons name={getCategoryIcon(task.category) as any} size={11} color={catColor} style={{ marginRight: 4 }} />
              <Text style={[styles.categoryText, { color: catColor }]}>{getCategoryBadgeLabel(task.category)}</Text>
            </View>

            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={11} color={colors.fgMuted} />
              <Text style={styles.durationText}>{formatDuration(task.durationMinutes)}</Text>
            </View>

            {submodules.length > 0 && (
              <View style={[styles.submodulesPill, doneSubmodulesCount === submodules.length && styles.submodulesPillDone]}>
                <Ionicons
                  name={doneSubmodulesCount === submodules.length ? 'checkmark-circle' : 'list-outline'}
                  size={11}
                  color={doneSubmodulesCount === submodules.length ? colors.accentFlow : colors.fgSubtle}
                />
                <Text
                  style={[
                    styles.submodulesPillText,
                    doneSubmodulesCount === submodules.length && { color: colors.accentFlow },
                  ]}
                >
                  {doneSubmodulesCount}/{submodules.length} Modules
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}
            numberOfLines={expanded ? undefined : 2}
          >
            {task.title}
          </Text>

          {/* Quick preview of description */}
          {task.description && !expanded && (
            <Text style={styles.taskExcerpt} numberOfLines={2}>
              {task.description}
            </Text>
          )}
        </View>

        {/* Expand / Collapse Button */}
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.6}
        >
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.fgMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Submodules Checklist (Always visible or in expanded, let's show in card directly for quick checking!) */}
      <View style={styles.submodulesSection}>
        <View style={styles.submodulesHeaderRow}>
          <Text style={styles.submodulesHeading}>SUBMODULES & EFFORT CHECKLIST</Text>
        </View>

        <View style={styles.submodulesList}>
          {submodules.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={[styles.submoduleRow, sub.completed && styles.submoduleRowDone]}
              onPress={() => onToggleSubtask?.(task.id, sub.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.subCheckbox,
                  sub.completed && { backgroundColor: colors.accentFlow, borderColor: colors.accentFlow },
                ]}
              >
                {sub.completed && <Ionicons name="checkmark" size={13} color="#0B1220" />}
              </View>

              <Text
                style={[
                  styles.subTitle,
                  sub.completed && styles.subTitleDone,
                ]}
                numberOfLines={expanded ? undefined : 2}
              >
                {sub.title}
              </Text>

              <View style={styles.subDurationBadge}>
                <Text style={styles.subDurationText}>
                  {formatDuration(sub.durationMinutes)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedContent}>
          {task.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionHeading}>INSTRUCTIONS & OUTCOMES</Text>
              <Text style={styles.fullDescription}>{task.description}</Text>
            </View>
          )}

          {/* Resources & Links */}
          {resources.length > 0 && (
            <View style={styles.resourcesSection}>
              <Text style={styles.sectionHeading}>CURATED LABS, DOCS & DRILLS</Text>
              <View style={styles.resourceLinksList}>
                {resources.map((res, idx) => (
                  <TouchableOpacity
                    key={`${res.url}-${idx}`}
                    style={styles.resourceLinkRow}
                    onPress={() => handleOpenUrl(res.url)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        res.label.includes('YouTube')
                          ? 'logo-youtube'
                          : res.label.includes('LeetCode')
                          ? 'code-outline'
                          : 'open-outline'
                      }
                      size={14}
                      color={
                        res.label.includes('YouTube')
                          ? '#EF4444'
                          : res.label.includes('LeetCode')
                          ? colors.accentWarn
                          : colors.accentFlow
                      }
                    />
                    <Text style={styles.resourceLabel} numberOfLines={1}>
                      {res.label}
                    </Text>
                    <Ionicons name="arrow-forward" size={12} color={colors.fgSubtle} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderLeftWidth: 4,
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardCompleted: {
    opacity: 0.85,
    borderColor: colors.borderSubtle,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    paddingBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgRaised,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: colors.fgMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  submodulesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  submodulesPillDone: {
    backgroundColor: colors.accentFlowDim,
  },
  submodulesPillText: {
    color: colors.fgMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  taskTitle: {
    color: colors.fgPrimary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.fgMuted,
  },
  taskExcerpt: {
    color: colors.fgMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  expandButton: {
    padding: 4,
    marginLeft: 4,
  },
  submodulesSection: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 4,
  },
  submodulesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  submodulesHeading: {
    color: colors.fgSubtle,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  submodulesList: {
    gap: 6,
  },
  submoduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgRaised,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 8,
  },
  submoduleRowDone: {
    opacity: 0.65,
    backgroundColor: colors.bgDeep,
  },
  subCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTitle: {
    flex: 1,
    color: colors.fgPrimary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  subTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.fgMuted,
  },
  subDurationBadge: {
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subDurationText: {
    color: colors.fgSubtle,
    fontSize: 9,
    fontWeight: '700',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bgDeep,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  descriptionSection: {
    marginBottom: 12,
  },
  sectionHeading: {
    color: colors.fgSubtle,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  fullDescription: {
    color: colors.fgPrimary,
    fontSize: 13,
    lineHeight: 19,
  },
  resourcesSection: {
    marginTop: 4,
  },
  resourceLinksList: {
    gap: 6,
    marginTop: 4,
  },
  resourceLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  resourceLabel: {
    flex: 1,
    color: colors.fgPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
});
