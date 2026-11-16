import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, TextInput } from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { AppSettings } from '../types';
import { colors } from '../theme/colors';
import { NotificationService } from '../services/notifications';
import { SupabaseService } from '../services/supabase';
import { DEFAULT_SUPABASE_CONFIG } from '../config/supabaseConfig';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [testingNotification, setTestingNotification] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(
    settings.supabaseSettings?.url || DEFAULT_SUPABASE_CONFIG.url || ''
  );
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseSettings?.anonKey || '');
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(SupabaseService.isReady());

  const handleTestAndSaveSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      Alert.alert('Missing Info', 'Please enter both your Supabase URL and Anon Key.');
      return;
    }
    setTestingSupabase(true);
    const result = await SupabaseService.testConnection(supabaseUrl.trim(), supabaseKey.trim());
    setTestingSupabase(false);

    if (result.success) {
      SupabaseService.initClient(supabaseUrl.trim(), supabaseKey.trim());
      setSupabaseConnected(true);
      onUpdateSettings({
        supabaseSettings: {
          url: supabaseUrl.trim(),
          anonKey: supabaseKey.trim(),
          syncEnabled: true,
        },
      });
      Alert.alert(
        'Connected to Supabase! ☁️',
        'Cloud sync is active! Daily study notes generated from your IDE and task completions will now synchronize automatically.'
      );
    } else {
      Alert.alert('Connection Failed', result.error || 'Could not verify connection to Supabase.');
    }
  };

  const pushEnabled = settings.notificationSettings?.pushEnabled ?? true;
  const reminderType = settings.notificationSettings?.reminderType ?? 'daily-1pm';

  const handleTogglePush = async (val: boolean) => {
    if (val) {
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Needed',
          'Please allow notifications in your device settings to receive study reminders.'
        );
        return;
      }
      if (reminderType === 'hourly') {
        await NotificationService.scheduleHourlyReminder();
      } else {
        await NotificationService.scheduleDailyReminder(13, 0); // 1:00 PM
      }
    } else {
      await NotificationService.cancelAll();
    }

    onUpdateSettings({
      notificationSettings: {
        ...settings.notificationSettings,
        pushEnabled: val,
      },
    });
  };

  const handleSelectReminderType = async (type: 'daily-1pm' | 'hourly') => {
    if (pushEnabled) {
      if (type === 'hourly') {
        await NotificationService.scheduleHourlyReminder();
        Alert.alert('Reminder Updated', 'You will receive study check-in reminders every 1 hour.');
      } else {
        await NotificationService.scheduleDailyReminder(13, 0);
        Alert.alert('Reminder Updated', 'You will receive your daily study reminder every day at 1:00 PM.');
      }
    }

    onUpdateSettings({
      notificationSettings: {
        ...settings.notificationSettings,
        reminderType: type,
        pushTime: type === 'daily-1pm' ? '13:00' : 'hourly',
      },
    });
  };

  const handleTestNotification = async () => {
    setTestingNotification(true);
    const sent = await NotificationService.sendInstantTestNotification();
    setTestingNotification(false);

    if (sent) {
      Alert.alert(
        'Notification Triggered! 🔔',
        'A test reminder was fired. Check your phone\'s notification bar!'
      );
    } else {
      Alert.alert(
        'Permission Required',
        'Could not trigger notification. Please ensure notification permissions are allowed for Expo Go.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings & Config</Text>
        <Text style={styles.subtitle}>Curriculum parameters, notifications & data</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Reminders & Notifications Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="notifications-outline" size={18} color={colors.accentFlow} />
            <Text style={styles.sectionTitle}>Daily Study Reminders</Text>
          </View>
          <Text style={styles.helpText}>
            Get notified of today's core curriculum tasks and habits.
          </Text>

          {/* Toggle Switch */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Enable Reminders</Text>
              <Text style={styles.toggleSub}>
                {pushEnabled ? 'Active' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handleTogglePush}
              trackColor={{ false: colors.bgRaised, true: colors.accentFlowDim }}
              thumbColor={pushEnabled ? colors.accentFlow : colors.fgSubtle}
            />
          </View>

          {pushEnabled && (
            <View style={styles.reminderOptions}>
              <Text style={styles.optionSectionTitle}>REMINDER SCHEDULE</Text>

              {/* 1:00 PM Option */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  reminderType === 'daily-1pm' && styles.optionCardSelected,
                ]}
                onPress={() => handleSelectReminderType('daily-1pm')}
                activeOpacity={0.7}
              >
                <View style={styles.optionRadio}>
                  {reminderType === 'daily-1pm' && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionTitle}>Every Day at 1:00 PM</Text>
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>RECOMMENDED</Text>
                    </View>
                  </View>
                  <Text style={styles.optionDesc}>
                    Daily checkpoint alert with today's 3 tasks & 4 micro-habits.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Hourly Option */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  reminderType === 'hourly' && styles.optionCardSelected,
                ]}
                onPress={() => handleSelectReminderType('hourly')}
                activeOpacity={0.7}
              >
                <View style={styles.optionRadio}>
                  {reminderType === 'hourly' && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Every 1 Hour</Text>
                  <Text style={styles.optionDesc}>
                    Hourly nudges to keep your study momentum and drills moving.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Test Button */}
              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestNotification}
                disabled={testingNotification}
                activeOpacity={0.8}
              >
                <Ionicons name="flash-outline" size={16} color="#0B1220" />
                <Text style={styles.testBtnText}>
                  {testingNotification ? 'Firing...' : 'Send Test Notification Now'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Active Study Plan Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="school-outline" size={17} color={colors.accentCalm} />
            <Text style={styles.sectionTitle}>Active Study Plan</Text>
          </View>

          <View style={styles.planInfoBox}>
            <Text style={styles.planTitle}>
              GCP Professional Data Engineer 60-Day Prep
            </Text>
            <Text style={styles.planDesc}>
              Structured 60-day syllabus covering BigQuery, Cloud Storage, Dataflow, Pub/Sub, Dataproc, IAM, dbt, Spark, Kafka, and Python/SQL/Interview drills.
            </Text>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>START DATE</Text>
                <Text style={styles.metaValue}>Nov 1, 2026</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>END DATE</Text>
                <Text style={styles.metaValue}>Dec 31, 2026</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>TOTAL DAYS</Text>
                <Text style={styles.metaValue}>61 Days</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>DAILY PACE</Text>
                <Text style={styles.metaValue}>3 Tasks/Day</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Supabase Cloud Sync & IDE Integration */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="cloud-upload-outline" size={17} color={colors.accentFlow} />
            <Text style={styles.sectionTitle}>Supabase Cloud Sync & IDE</Text>
            <View
              style={[
                styles.cloudStatusBadge,
                supabaseConnected ? styles.cloudStatusConnected : styles.cloudStatusOffline,
              ]}
            >
              <Text
                style={[
                  styles.cloudStatusText,
                  supabaseConnected && { color: colors.accentFlow },
                ]}
              >
                {supabaseConnected ? 'CONNECTED' : 'LOCAL MODE'}
              </Text>
            </View>
          </View>
          <Text style={styles.helpText}>
            Connect your hosted PostgreSQL database to sync daily notes and progress between your IDE and phone.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SUPABASE PROJECT URL</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://your-project.supabase.co"
              placeholderTextColor={colors.fgSubtle}
              value={supabaseUrl}
              onChangeText={setSupabaseUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SUPABASE ANON KEY</Text>
            <TextInput
              style={styles.textInput}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              placeholderTextColor={colors.fgSubtle}
              value={supabaseKey}
              onChangeText={setSupabaseKey}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={styles.saveSyncBtn}
            onPress={handleTestAndSaveSupabase}
            disabled={testingSupabase}
            activeOpacity={0.8}
          >
            <Ionicons name="link-outline" size={16} color="#0B1220" />
            <Text style={styles.saveSyncBtnText}>
              {testingSupabase ? 'Verifying...' : 'Save & Connect Cloud Sync'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Source Reference */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="code-working-outline" size={17} color={colors.fgMuted} />
            <Text style={styles.sectionTitle}>Origin & Architecture</Text>
          </View>

          <TouchableOpacity
            style={styles.repoLink}
            onPress={() =>
              Linking.openURL('https://github.com/itsme-sherlock/habit-tracker')
            }
            activeOpacity={0.7}
          >
            <Ionicons name="logo-github" size={18} color={colors.fgPrimary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.repoName}>itsme-sherlock/habit-tracker</Text>
              <Text style={styles.repoDesc}>Original Data Engineering 60 Study Tracker</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.fgMuted} />
          </TouchableOpacity>

          <View style={styles.aboutSpecs}>
            <Text style={styles.specLine}>• Theme: Midnight Pipeline Dark</Text>
            <Text style={styles.specLine}>• Notifications: Scheduled at 1:00 PM Daily</Text>
            <Text style={styles.specLine}>• Persistence: Offline-First AsyncStorage</Text>
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
  sectionCard: {
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
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.fgPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  helpText: {
    color: colors.fgMuted,
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 17,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgRaised,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  toggleLabel: {
    color: colors.fgPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  toggleSub: {
    color: colors.accentFlow,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  reminderOptions: {
    marginTop: 12,
    gap: 8,
  },
  optionSectionTitle: {
    color: colors.fgSubtle,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bgRaised,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 10,
  },
  optionCardSelected: {
    borderColor: colors.accentFlow,
    backgroundColor: colors.bgElevated,
  },
  optionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.accentFlow,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.accentFlow,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    color: colors.fgPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  recommendedBadge: {
    backgroundColor: colors.accentFlowDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.3)',
  },
  recommendedText: {
    color: colors.accentFlow,
    fontSize: 9,
    fontWeight: '800',
  },
  optionDesc: {
    color: colors.fgMuted,
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentFlow,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  testBtnText: {
    color: '#0B1220',
    fontSize: 13,
    fontWeight: '800',
  },
  planInfoBox: {
    backgroundColor: colors.bgRaised,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 4,
  },
  planTitle: {
    color: colors.fgPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  planDesc: {
    color: colors.fgMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    width: '48%',
    backgroundColor: colors.bgSurface,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  metaLabel: {
    color: colors.fgSubtle,
    fontSize: 9,
    fontWeight: '700',
  },
  metaValue: {
    color: colors.accentFlow,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  repoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bgRaised,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 4,
  },
  repoName: {
    color: colors.fgPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  repoDesc: {
    color: colors.fgMuted,
    fontSize: 11,
    marginTop: 2,
  },
  aboutSpecs: {
    marginTop: 10,
    gap: 4,
  },
  specLine: {
    color: colors.fgSubtle,
    fontSize: 11,
  },
  cloudStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 'auto',
  },
  cloudStatusConnected: {
    backgroundColor: colors.accentFlowDim,
    borderColor: colors.accentFlow,
  },
  cloudStatusOffline: {
    backgroundColor: colors.bgRaised,
    borderColor: colors.borderSubtle,
  },
  cloudStatusText: {
    color: colors.fgSubtle,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginTop: 10,
  },
  inputLabel: {
    color: colors.fgSubtle,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.bgDeep,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    color: colors.fgPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
  },
  saveSyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentFlow,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  saveSyncBtnText: {
    color: '#0B1220',
    fontSize: 13,
    fontWeight: '800',
  },
});
