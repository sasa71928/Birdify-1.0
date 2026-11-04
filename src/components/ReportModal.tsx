import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../hooks/useDynamicStyles';
import { Radius, Spacing, Typography } from '../theme';
import { ReportRepository } from '../repositories/report.repository';
import { useT } from '../i18n';

interface ReportModalProps {
  visible: boolean;
  reporterId: string;
  sightingId?: string | null;
  reportedUserId?: string | null;
  targetLabel?: string;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.canvasPure,
      borderRadius: Radius.xl || 20,
      padding: Spacing.lg,
      maxHeight: '85%',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
      flex: 1,
    },
    subtitle: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: Spacing.md,
      lineHeight: 19,
    },
    reasonOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border + '35',
      marginBottom: 8,
    },
    reasonOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '12',
    },
    reasonText: {
      flex: 1,
      marginLeft: 10,
      fontSize: Typography.fontSize.sm,
      color: colors.textPrimary,
    },
    notesInput: {
      marginTop: Spacing.xs,
      borderWidth: 1,
      borderColor: colors.border + '40',
      borderRadius: Radius.md,
      backgroundColor: colors.componentBase,
      color: colors.textPrimary,
      padding: 12,
      minHeight: 72,
      textAlignVertical: 'top',
      fontSize: Typography.fontSize.sm,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: Spacing.lg,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: Radius.md,
      backgroundColor: colors.componentBase,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: Radius.md,
      backgroundColor: colors.errorRed || '#FF5252',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semiBold,
      color: colors.textPrimary,
    },
    submitText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semiBold,
      color: '#FFFFFF',
    },
  });

export default function ReportModal({
  visible,
  reporterId,
  sightingId,
  reportedUserId,
  targetLabel,
  onClose,
  onSuccess,
  onError,
}: ReportModalProps) {
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const { t } = useT();
  const reasons = [
    { key: 'inappropriate', label: t('reports.reasons.inappropriate') },
    { key: 'spam', label: t('reports.reasons.spam') },
    { key: 'misinformation', label: t('reports.reasons.misinformation') },
    { key: 'harassment', label: t('reports.reasons.harassment') },
    { key: 'protectedSpecies', label: t('reports.reasons.protectedSpecies') },
  ];
  const [selectedReasonKey, setSelectedReasonKey] = useState<string>('inappropriate');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const selectedLabel = reasons.find((r) => r.key === selectedReasonKey)?.label || selectedReasonKey;
      const fullReason = details.trim()
        ? `${selectedLabel}: ${details.trim()}`
        : selectedLabel;

      await ReportRepository.create({
        reporterId,
        sightingId,
        reportedUserId,
        reason: fullReason,
      });

      setDetails('');
      setSelectedReasonKey('inappropriate');
      onClose();
      onSuccess?.();
    } catch (e: any) {
      onError?.(e?.message || t('reports.reportFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => { if (!submitting) onClose(); }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {sightingId ? t('reports.reportPost') : t('reports.reportUser')}
            </Text>
            <TouchableOpacity disabled={submitting} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {targetLabel
              ? t('reports.targetPrompt', { target: targetLabel })
              : t('reports.generalPrompt')}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {reasons.map((item) => {
              const active = selectedReasonKey === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.reasonOption, active && styles.reasonOptionSelected]}
                  onPress={() => setSelectedReasonKey(item.key)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={active ? colors.primary : colors.textSecondary}
                  />
                  <Text style={styles.reasonText}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}

            <TextInput
              style={styles.notesInput}
              placeholder={t('reports.additionalNotes')}
              placeholderTextColor={colors.placeholder}
              value={details}
              onChangeText={setDetails}
              maxLength={300}
              multiline
              editable={!submitting}
            />
          </ScrollView>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              disabled={submitting}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>{t('reports.sendReport')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

