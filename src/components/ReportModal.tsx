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

const REPORT_REASONS = [
  'Contenido inapropiado u ofensivo',
  'Spam o publicidad engañosa',
  'Identificación falsa o desinformación',
  'Acoso o comportamiento abusivo',
  'Exposición de nido o especie protegida en riesgo',
];

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
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const fullReason = details.trim()
        ? `${selectedReason}: ${details.trim()}`
        : selectedReason;

      await ReportRepository.create({
        reporterId,
        sightingId,
        reportedUserId,
        reason: fullReason,
      });

      setDetails('');
      setSelectedReason(REPORT_REASONS[0]);
      onClose();
      onSuccess?.();
    } catch (e: any) {
      onError?.(e?.message || 'No se pudo enviar el reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !submitting && onClose()}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {sightingId ? 'Reportar publicación' : 'Reportar usuario'}
            </Text>
            <TouchableOpacity disabled={submitting} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {targetLabel
              ? `Selecciona el motivo por el que deseas reportar a ${targetLabel}. Nuestro equipo de moderación lo revisará en menos de 24 horas.`
              : 'Selecciona el motivo del reporte. Nuestro equipo de moderación revisará el contenido.'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {REPORT_REASONS.map((reason) => {
              const active = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonOption, active && styles.reasonOptionSelected]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={active ? colors.primary : colors.textSecondary}
                  />
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              );
            })}

            <TextInput
              style={styles.notesInput}
              placeholder="Detalles adicionales (opcional)..."
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
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Enviar reporte</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

