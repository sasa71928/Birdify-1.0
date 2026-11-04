import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, Radius, Shadows } from '../../theme';
import { useT } from '../../i18n';

interface FeedBlockConfirmModalProps {
  visible: boolean;
  isBlocking: boolean;
  username: string;
  onClose: () => void;
  onConfirm: () => void;
  styles: any;
  colors: any;
}

export const FeedBlockConfirmModal: React.FC<FeedBlockConfirmModalProps> = React.memo(({
  visible,
  isBlocking,
  username,
  onClose,
  onConfirm,
  styles,
  colors,
}) => {
  const { t } = useT();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => {
        if (!isBlocking) onClose();
      }}
    >
      <View style={[styles.optionsOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: '#000', opacity: 0.5 },
          ]}
        />

        <View
          style={{
            backgroundColor: colors.canvasPure,
            borderRadius: 20,
            padding: Spacing.lg,
            width: '80%',
            ...Shadows.modal,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FF5252',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Spacing.md,
              }}
            >
              <Ionicons name="ban-outline" size={40} color={colors.canvasPure} />
            </View>

            <Text
              style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: colors.textPrimary,
                textAlign: 'center',
                fontFamily: Typography.fontFamilyDisplay,
                marginBottom: Spacing.sm,
              }}
            >
              {t('feed.blockUserTitle', { username })}
            </Text>

            <Text
              style={{
                fontSize: Typography.fontSize.md,
                color: colors.textSecondary,
                textAlign: 'center',
                fontFamily: Typography.fontFamilyBody,
                lineHeight: Typography.lineHeight.normal,
                marginBottom: Spacing.sm,
              }}
            >
              {t('feed.blockUserDesc')}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg }}>
            <TouchableOpacity
              disabled={isBlocking}
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: Spacing.md,
                borderRadius: Radius.md,
                backgroundColor: colors.componentBase,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: Typography.fontSize.md,
                  fontWeight: Typography.fontWeight.semiBold,
                  color: colors.textPrimary,
                  fontFamily: Typography.fontFamilyDisplay,
                }}
              >
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isBlocking}
              onPress={onConfirm}
              style={{
                flex: 1,
                paddingVertical: Spacing.md,
                borderRadius: Radius.md,
                backgroundColor: '#FF5252',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isBlocking ? 0.7 : 1,
              }}
            >
              {isBlocking ? (
                <ActivityIndicator size="small" color={colors.canvasPure} />
              ) : (
                <Text
                  style={{
                    fontSize: Typography.fontSize.md,
                    fontWeight: Typography.fontWeight.semiBold,
                    color: colors.canvasPure,
                    fontFamily: Typography.fontFamilyDisplay,
                  }}
                >
                  {t('feed.blockUser')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});
