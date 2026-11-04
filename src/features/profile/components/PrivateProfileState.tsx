import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { useT } from '../../../i18n';
import { Radius, Typography, Shadows } from '../../../theme';

export const PrivateProfileState: React.FC = () => {
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.canvasPure,
            borderColor: isDark ? colors.border + '30' : colors.border + '20',
          },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.primary + '14' },
          ]}
        >
          <Ionicons name="lock-closed" size={34} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t('profile.privateAccountTitle')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('profile.privateAccountSubtitle')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    padding: 32,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    ...Shadows.card,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});

