import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Radius, Spacing, Typography, Shadows } from '../../theme';
import { useT } from '../../i18n';
import { PressableScale } from '../animated/PressableScale';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  isDestructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  iconName = 'alert-circle-outline',
  iconColor,
  isDestructive = true,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const { colors } = useDynamicStyles();
  const { t } = useT();

  const finalConfirmLabel =
    confirmLabel || (isDestructive ? t('common.delete') : t('common.save'));
  const finalCancelLabel = cancelLabel || t('common.cancel');
  const finalIconColor =
    iconColor || (isDestructive ? colors.danger : colors.primary);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.canvasPure,
              borderColor: colors.border + '20',
            },
          ]}
        >
          {iconName && (
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: finalIconColor + '18' },
              ]}
            >
              <Ionicons name={iconName} size={36} color={finalIconColor} />
            </View>
          )}

          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontFamily: Typography.fontFamilyDisplay,
              },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.message,
              {
                color: colors.textSecondary,
                fontFamily: Typography.fontFamilyBody,
              },
            ]}
          >
            {message}
          </Text>

          <View style={styles.buttonsRow}>
            <PressableScale
              activeScale={0.98}
              haptic="light"
              style={[
                styles.btn,
                styles.cancelBtn,
                { backgroundColor: colors.componentBase },
              ]}
              disabled={loading}
              onPress={onCancel}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  {
                    color: colors.textPrimary,
                    fontFamily: Typography.fontFamilyDisplay,
                  },
                ]}
              >
                {finalCancelLabel}
              </Text>
            </PressableScale>

            <PressableScale
              activeScale={0.98}
              haptic={isDestructive ? 'medium' : 'light'}
              style={[
                styles.btn,
                {
                  backgroundColor: isDestructive
                    ? colors.danger
                    : colors.primary,
                },
              ]}
              disabled={loading}
              onPress={onConfirm}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.confirmBtnText,
                    { fontFamily: Typography.fontFamilyDisplay },
                  ]}
                >
                  {finalConfirmLabel}
                </Text>
              )}
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.modal,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 0,
  },
  cancelBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
});
