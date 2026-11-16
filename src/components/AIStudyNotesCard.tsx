import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { StudyNoteRecord } from '../types';
import { SupabaseService } from '../services/supabase';

interface AIStudyNotesCardProps {
  currentDate: string;
  topicTitle?: string;
  onRefresh?: () => void;
}

// Fallback curated notes for common curriculum days
const DEFAULT_NOTES: Record<string, StudyNoteRecord> = {
  default: {
    date: 'today',
    topic: 'GCP BigQuery & Performance Tuning Architecture',
    summary: 'Internal columnar storage mechanics, slot scheduling, and cost optimization for 4-YoE Data Engineering interviews.',
    keyConcepts: [
      'Capacitor Columnar Storage: Encodes columns with run-length, dictionary, and bit-packed compression. Prunes unreferenced columns before scanning.',
      'Borg Compute Slots: Dynamic slot allocator. On-demand queries compete for a shared slot pool; BigQuery Editions provide dedicated reservations with autoscaling.',
      'Partitioning vs Clustering: Partitioning physically isolates data into daily blocks (up to 4,000); clustering sorts records within partitions for multi-column block skipping.'
    ],
    failureModes: [
      'Slot Starvation & Execution Spill: Complex unpartitioned joins exhaust available slots; stages spill intermediate state to persistent shuffle disk, ballooning query time from 15s to 30 mins.',
      'Partition Pruning Invalidation: Wrapping partitioned columns in functions (e.g. WHERE DATE(ts) = ...) triggers full table scans, multiplying query scan costs by 50x.'
    ],
    metricsScale: [
      'Scanned volume slashed from 14 TB to 110 GB per run via date partitioning and clustering on user_id, event_type.',
      'Query spend reduced by 35% with BigQuery Editions (100 baseline slots + 200 autoscale ceiling).'
    ],
    interviewQA: [
      {
        question: 'How do you optimize a query scanning multiple terabytes in BigQuery?',
        answer: 'Inspect query execution details in INFORMATION_SCHEMA.JOBS to see slot usage and spilled bytes. Enforce DATE partitioning, cluster by high-cardinality filter fields, eliminate SELECT *, and pre-filter with CTEs before joining.'
      },
      {
        question: 'When would you recommend BigQuery Editions over on-demand pricing?',
        answer: 'When monthly on-demand scanning exceeds $10,000/month or query workloads require predictable latency SLAs. Editions allow committed slot discounts, budget caps, and autoscaling slot capacity.'
      }
    ],
    codeSnippet: `-- 4-YoE Production Pattern: Atomic MERGE with Date Partitioning
MERGE INTO analytics.fact_events T
USING staging.stg_events S
ON T.event_date = S.event_date AND T.event_id = S.event_id
WHEN MATCHED THEN
  UPDATE SET T.payload = S.payload, T.updated_at = CURRENT_TIMESTAMP()
WHEN NOT MATCHED THEN
  INSERT (event_date, event_id, payload, created_at)
  VALUES (S.event_date, S.event_id, S.payload, CURRENT_TIMESTAMP());`
  }
};

export const AIStudyNotesCard: React.FC<AIStudyNotesCardProps> = ({
  currentDate,
  topicTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'failures' | 'interview' | 'code' | 'markdown'>('concepts');
  const [note, setNote] = useState<StudyNoteRecord>(DEFAULT_NOTES.default);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadNote = async () => {
      setLoading(true);
      if (SupabaseService.isReady()) {
        const remote = await SupabaseService.fetchStudyNotes(currentDate);
        if (remote && isMounted) {
          setNote(remote);
          setIsCloudSynced(true);
          setLoading(false);
          return;
        }
      }

      if (isMounted) {
        setIsCloudSynced(false);
        setNote({
          ...DEFAULT_NOTES.default,
          date: currentDate,
          topic: topicTitle || DEFAULT_NOTES.default.topic,
        });
        setLoading(false);
      }
    };

    loadNote();
    return () => {
      isMounted = false;
    };
  }, [currentDate, topicTitle]);

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="hardware-chip-outline" size={16} color={colors.accentFlow} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>AI Study Notes & 4-YoE Prep</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {note.topic}
            </Text>
          </View>
          <View style={[styles.syncBadge, isCloudSynced ? styles.syncBadgeCloud : styles.syncBadgeLocal]}>
            <Ionicons
              name={isCloudSynced ? 'cloud-done-outline' : 'cloud-offline-outline'}
              size={12}
              color={isCloudSynced ? colors.accentFlow : colors.fgSubtle}
            />
            <Text style={[styles.syncText, isCloudSynced && { color: colors.accentFlow }]}>
              {isCloudSynced ? 'Supabase' : 'Offline'}
            </Text>
          </View>
        </View>

        {note.summary ? (
          <Text style={styles.summaryText}>{note.summary}</Text>
        ) : null}

        {/* Tab Switcher */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'concepts' && styles.tabBtnActive]}
            onPress={() => setActiveTab('concepts')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="bulb-outline"
              size={13}
              color={activeTab === 'concepts' ? colors.accentFlow : colors.fgSubtle}
            />
            <Text style={[styles.tabLabel, activeTab === 'concepts' && styles.tabLabelActive]}>
              Concepts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'failures' && styles.tabBtnActive]}
            onPress={() => setActiveTab('failures')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="warning-outline"
              size={13}
              color={activeTab === 'failures' ? colors.accentWarn : colors.fgSubtle}
            />
            <Text style={[styles.tabLabel, activeTab === 'failures' && styles.tabLabelActive]}>
              Failures
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'interview' && styles.tabBtnActive]}
            onPress={() => setActiveTab('interview')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={13}
              color={activeTab === 'interview' ? colors.accentPurple : colors.fgSubtle}
            />
            <Text style={[styles.tabLabel, activeTab === 'interview' && styles.tabLabelActive]}>
              Interview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'code' && styles.tabBtnActive]}
            onPress={() => setActiveTab('code')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="code-slash-outline"
              size={13}
              color={activeTab === 'code' ? colors.accentCalm : colors.fgSubtle}
            />
            <Text style={[styles.tabLabel, activeTab === 'code' && styles.tabLabelActive]}>
              Code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'markdown' && styles.tabBtnActive]}
            onPress={() => setActiveTab('markdown')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="document-text-outline"
              size={13}
              color={activeTab === 'markdown' ? colors.accentFlow : colors.fgSubtle}
            />
            <Text style={[styles.tabLabel, activeTab === 'markdown' && styles.tabLabelActive]}>
              .MD
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.contentBox}>
        {activeTab === 'concepts' && (
          <View style={styles.sectionBody}>
            {note.keyConcepts.map((item, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}

            {note.metricsScale && note.metricsScale.length > 0 && (
              <View style={styles.metricsBox}>
                <Text style={styles.metricsHeader}>PROD SCALE METRICS (FOR 4 YoE):</Text>
                {note.metricsScale.map((m, idx) => (
                  <Text key={idx} style={styles.metricLine}>
                    • {m}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'failures' && (
          <View style={styles.sectionBody}>
            <Text style={styles.sectionNotice}>
              ⚠️ Production failure modes interviewers use to verify real-world experience:
            </Text>
            {note.failureModes.map((item, idx) => (
              <View key={idx} style={styles.failureItem}>
                <Ionicons name="alert-circle" size={15} color={colors.accentWarn} style={{ marginTop: 2 }} />
                <Text style={styles.failureText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'interview' && (
          <View style={styles.sectionBody}>
            {note.interviewQA.map((qa, idx) => (
              <View key={idx} style={styles.qaCard}>
                <Text style={styles.qaQuestion}>Q: {qa.question}</Text>
                <Text style={styles.qaAnswer}>A: {qa.answer}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'code' && (
          <View style={styles.sectionBody}>
            {note.codeSnippet ? (
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{note.codeSnippet}</Text>
              </View>
            ) : (
              <Text style={styles.emptyCode}>No code snippet attached for this session.</Text>
            )}
          </View>
        )}

        {activeTab === 'markdown' && (
          <View style={styles.sectionBody}>
            <View style={styles.markdownBox}>
              <Text style={styles.markdownText}>
                {note.rawMarkdown || `# Day ${currentDate}: ${note.topic}\n\n${note.summary}`}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.25)',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.bgRaised,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: colors.accentFlowDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.fgPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.accentFlow,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  syncBadgeCloud: {
    backgroundColor: colors.accentFlowDim,
    borderColor: colors.accentFlow,
  },
  syncBadgeLocal: {
    backgroundColor: colors.bgDeep,
    borderColor: colors.borderSubtle,
  },
  syncText: {
    color: colors.fgSubtle,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryText: {
    color: colors.fgMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tabBtnActive: {
    borderColor: colors.accentFlow,
    backgroundColor: colors.bgElevated,
  },
  tabLabel: {
    color: colors.fgSubtle,
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.fgPrimary,
    fontWeight: '800',
  },
  contentBox: {
    padding: 12,
    backgroundColor: colors.bgSurface,
  },
  sectionBody: {
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentFlow,
    marginTop: 6,
  },
  bulletText: {
    color: colors.fgPrimary,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  metricsBox: {
    backgroundColor: colors.bgDeep,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginTop: 6,
  },
  metricsHeader: {
    color: colors.accentCalm,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricLine: {
    color: colors.fgPrimary,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionNotice: {
    color: colors.accentWarn,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  failureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.25)',
  },
  failureText: {
    color: colors.fgPrimary,
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  qaCard: {
    backgroundColor: colors.bgDeep,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 4,
  },
  qaQuestion: {
    color: colors.accentPurple,
    fontSize: 12,
    fontWeight: '800',
  },
  qaAnswer: {
    color: colors.fgPrimary,
    fontSize: 11,
    lineHeight: 16,
  },
  codeContainer: {
    backgroundColor: '#070C14',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  codeText: {
    color: '#34D399',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  emptyCode: {
    color: colors.fgSubtle,
    fontSize: 11,
    fontStyle: 'italic',
  },
  markdownBox: {
    backgroundColor: '#070C14',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  markdownText: {
    color: colors.fgPrimary,
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
