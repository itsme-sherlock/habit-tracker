import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getDayNumber } from '../utils/date';

interface AIPromptModalProps {
  visible: boolean;
  onClose: () => void;
  dateStr: string;
  promptText: string;
}

export const AIPromptModal: React.FC<AIPromptModalProps> = ({
  visible,
  onClose,
  dateStr,
  promptText,
}) => {
  const [copied, setCopied] = useState(false);
  const dayNum = getDayNumber(dateStr);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Day ${dayNum} Study Prompt for AI`,
        message: promptText,
      });
    } catch (e) {}
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.sparkleDot} />
              <Ionicons name="sparkles" size={18} color={colors.accentFlow} />
              <Text style={styles.headerTitle}>Day {dayNum} AI Study Prompt</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.fgSubtle} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Paste this prompt into ChatGPT, Claude, or Grok. It instructs the AI to break down documentation, step-by-step hands-on code, and SQL/Python drills into a complete Markdown file.
          </Text>

          {/* Prompt Preview Box */}
          <ScrollView style={styles.promptScroll} showsVerticalScrollIndicator>
            <Text style={styles.promptText}>{promptText}</Text>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.copyBtn, copied && styles.copiedBtn]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Ionicons
                name={copied ? 'checkmark-circle' : 'copy-outline'}
                size={16}
                color={copied ? '#FFFFFF' : '#0B1220'}
              />
              <Text style={[styles.copyBtnText, copied && styles.copiedBtnText]}>
                {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={16} color={colors.accentFlow} />
              <Text style={styles.shareBtnText}>Share / Open App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentFlow,
  },
  headerTitle: {
    color: colors.fgPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    color: colors.fgSubtle,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  promptScroll: {
    backgroundColor: colors.bgDeep,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    maxHeight: 320,
    marginBottom: 16,
  },
  promptText: {
    color: colors.fgPrimary,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  copyBtn: {
    backgroundColor: colors.accentFlow,
  },
  copiedBtn: {
    backgroundColor: colors.accentSuccess,
  },
  copyBtnText: {
    color: '#0B1220',
    fontSize: 13,
    fontWeight: '700',
  },
  copiedBtnText: {
    color: '#FFFFFF',
  },
  shareBtn: {
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.accentFlow,
  },
  shareBtnText: {
    color: colors.accentFlow,
    fontSize: 13,
    fontWeight: '700',
  },
});
