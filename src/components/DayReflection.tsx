import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface DayReflectionProps {
  initialNotes?: string;
  initialMood?: 1 | 2 | 3 | 4 | 5;
  onSave: (notes: string, mood?: 1 | 2 | 3 | 4 | 5) => void;
}

const MOODS: { level: 1 | 2 | 3 | 4 | 5; label: string; icon: string; color: string }[] = [
  { level: 1, label: 'Drained', icon: 'sad-outline', color: '#EF4444' },
  { level: 2, label: 'Struggling', icon: 'cloud-outline', color: '#F97316' },
  { level: 3, label: 'Steady', icon: 'checkmark-circle-outline', color: '#3B82F6' },
  { level: 4, label: 'Focused', icon: 'bulb-outline', color: colors.accentFlow },
  { level: 5, label: 'Crushed it', icon: 'rocket-outline', color: colors.accentWarn },
];

export const DayReflection: React.FC<DayReflectionProps> = ({
  initialNotes = '',
  initialMood,
  onSave,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>(initialMood);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
    setMood(initialMood);
    setIsSaved(false);
  }, [initialNotes, initialMood]);

  const handleSave = () => {
    onSave(notes, mood);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="journal-outline" size={16} color={colors.accentWarn} />
          <Text style={styles.title}>Daily Reflection & Mood</Text>
        </View>
        {isSaved && <Text style={styles.savedPill}>Saved ✓</Text>}
      </View>

      {/* Mood Selector */}
      <View style={styles.moodRow}>
        {MOODS.map((m) => {
          const isSelected = mood === m.level;
          return (
            <TouchableOpacity
              key={m.level}
              style={[
                styles.moodBtn,
                isSelected && {
                  backgroundColor: `${m.color}25`,
                  borderColor: m.color,
                },
              ]}
              onPress={() => {
                setMood(m.level);
                onSave(notes, m.level);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={m.icon as any}
                size={18}
                color={isSelected ? m.color : colors.fgMuted}
              />
              <Text
                style={[
                  styles.moodLabel,
                  isSelected && { color: m.color, fontWeight: '700' },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notes Input */}
      <TextInput
        style={styles.input}
        placeholder="Key takeaway, tricky concept, or interview notes..."
        placeholderTextColor={colors.fgSubtle}
        multiline
        value={notes}
        onChangeText={setNotes}
        onBlur={handleSave}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Ionicons name="checkmark" size={14} color="#0B1220" />
        <Text style={styles.saveBtnText}>Save Day Log</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: colors.fgPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  savedPill: {
    color: colors.accentFlow,
    fontSize: 11,
    fontWeight: '700',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  moodLabel: {
    color: colors.fgMuted,
    fontSize: 9,
    marginTop: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.bgRaised,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 10,
    color: colors.fgPrimary,
    fontSize: 12,
    minHeight: 65,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentFlow,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#0B1220',
    fontSize: 12,
    fontWeight: '800',
  },
});
