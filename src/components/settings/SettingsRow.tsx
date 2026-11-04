import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Radius, Typography, Spacing } from '../../theme';
import { PressableScale } from '../animated/PressableScale';

export interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  label: string;
  sublabel?: string;
  value?: string;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  danger?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  badge?: string;
  isLast?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconColor,
  iconBgColor,
  label,
  sublabel,
  value,
  rightElement,
  showChevron = true,
  danger = false,
  onPress,
  disabled = false,
  badge,
  isLast = false,
}) => {
  const { colors, isDark } = useDynamicStyles();

  const primaryIconColor = danger
    ? colors.errorRed
    : iconColor || colors.primary;

  const bgTileColor = danger
    ? colors.errorRed + '18'
    : iconBgColor || (isDark ? colors.primary + '25' : colors.primary + '14');

  const content = (
    <View style={styles.row}>
      {/* Icon tile */}
      <View style={[styles.iconWrap, { backgroundColor: bgTileColor }]}>
        <Ionicons name={icon} size={20} color={primaryIconColor} />
      </View>

      {/* Texts */}
      <View style={styles.textWrap}>
        <View style={styles.labelRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              {
                color: danger ? colors.errorRed : colors.textPrimary,
              },
            ]}
          >
            {label}
          </Text>
          {badge && (
            <View
              style={[
                styles.badge,
                { backgroundColor: isDark ? '#333' : '#EEE' },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: isDark ? '#BBB' : '#666' },
                ]}
              >
                {badge}
              </Text>
            </View>
          )}
        </View>
        {sublabel && (
          <Text
            numberOfLines={2}
            style={[styles.sublabel, { color: colors.textSecondary }]}
          >
            {sublabel}
          </Text>
        )}
      </View>

      {/* Right accessory */}
      <View style={styles.rightWrap}>
        {value && (
          <Text style={[styles.valueText, { color: colors.textSecondary }]}>
            {value}
          </Text>
        )}
        {rightElement}
        {showChevron && !rightElement && !danger && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.outlineGrey + '70'}
            style={{ marginLeft: 6 }}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {onPress ? (
        <PressableScale
          activeScale={0.98}
          haptic={danger ? 'medium' : 'light'}
          onPress={onPress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          {content}
        </PressableScale>
      ) : (
        content
      )}
      {!isLast && (
        <View
          style={[
            styles.divider,
            { backgroundColor: colors.border + (isDark ? '20' : '18') },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '600',
  },
  sublabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 2,
    lineHeight: 16,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  valueText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    marginRight: 2,
  },
  divider: {
    height: 1,
    marginLeft: 38 + 14 + 16,
  },
});

