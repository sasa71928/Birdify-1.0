import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Typography, Radius } from '../../../theme';
import { useT } from '../../../i18n';

interface AttachmentModalProps {
  visible: boolean;
  onClose: () => void;
  onPickCamera: () => void;
  onPickGallery: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  visible,
  onClose,
  onPickCamera,
  onPickGallery,
}) => {
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  const handleCameraPress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics no soportado en emulador
    }
    onClose();
    onPickCamera();
  };

  const handleGalleryPress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics no soportado en emulador
    }
    onClose();
    onPickGallery();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t('chat.attachTitle')}
        </Text>

        <View style={styles.optionsWrap}>
          {/* Opción Cámara */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              {
                backgroundColor: colors.componentBase,
                borderColor: colors.border + '25',
              },
            ]}
            activeOpacity={0.7}
            onPress={handleCameraPress}
            accessibilityRole="button"
            accessibilityLabel={t('common.camera')}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isDark
                    ? 'rgba(16, 185, 129, 0.2)'
                    : '#ECFDF5',
                },
              ]}
            >
              <Ionicons
                name="camera"
                size={24}
                color={isDark ? '#34D399' : '#059669'}
              />
            </View>

            <View style={styles.textWrap}>
              <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                {t('common.camera')}
              </Text>
              <Text
                style={[styles.optionDesc, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {t('chat.cameraDesc')}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
              style={{ opacity: 0.6 }}
            />
          </TouchableOpacity>

          {/* Opción Galería */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              {
                backgroundColor: colors.componentBase,
                borderColor: colors.border + '25',
              },
            ]}
            activeOpacity={0.7}
            onPress={handleGalleryPress}
            accessibilityRole="button"
            accessibilityLabel={t('common.gallery')}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isDark
                    ? 'rgba(59, 130, 246, 0.2)'
                    : '#EFF6FF',
                },
              ]}
            >
              <Ionicons
                name="images"
                size={24}
                color={isDark ? '#60A5FA' : '#2563EB'}
              />
            </View>

            <View style={styles.textWrap}>
              <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                {t('common.gallery')}
              </Text>
              <Text
                style={[styles.optionDesc, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {t('chat.galleryDesc')}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
              style={{ opacity: 0.6 }}
            />
          </TouchableOpacity>
        </View>

        {/* Botón Cancelar */}
        <TouchableOpacity
          style={[styles.cancelBtn, { backgroundColor: colors.componentBase }]}
          activeOpacity={0.7}
          onPress={onClose}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            {t('common.cancel')}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    gap: 16,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    fontFamily: Typography.fontFamilyBody,
    textAlign: 'center',
  },
  optionsWrap: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 14,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: '700',
    fontFamily: Typography.fontFamilyBody,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
  },
  cancelBtn: {
    height: 44,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  cancelText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    fontFamily: Typography.fontFamilyBody,
  },
});

