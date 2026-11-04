import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Radius, Typography, Shadows } from '../../theme';

interface SettingsSectionProps {
  title?: string;
  footer?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  footer,
  children,
}) => {
  const { colors, isDark } = useDynamicStyles();

  return (
    <View style={styles.container}>
      {title && (
        <Text
          style={[
            styles.title,
            { color: colors.textSecondary },
          ]}
        >
          {title}
        </Text>
      )}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.canvasPure,
            borderColor: isDark ? colors.border + '30' : colors.border + '20',
          },
        ]}
      >
        {children}
      </View>

      {footer && (
        <Text
          style={[
            styles.footer,
            { color: colors.textSecondary },
          ]}
        >
          {footer}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 12,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 12,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.card,
  },
  footer: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 8,
    marginHorizontal: 12,
    lineHeight: 18,
  },
});

