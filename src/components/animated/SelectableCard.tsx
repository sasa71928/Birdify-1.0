import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useReducedMotion,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Radius, Typography, Shadows } from '../../theme';
import { PressableScale } from './PressableScale';

interface SelectableCardProps {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailingBadge?: string;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  selected,
  onPress,
  title,
  subtitle,
  leading,
  trailingBadge,
}) => {
  const { colors, isDark } = useDynamicStyles();
  const reducedMotion = useReducedMotion();

  const borderColor = selected
    ? colors.primary
    : isDark
    ? colors.border + '30'
    : colors.border + '25';

  const bgColor = selected
    ? isDark
      ? colors.primary + '18'
      : colors.primary + '0D'
    : colors.canvasPure;

  return (
    <PressableScale
      activeScale={0.98}
      haptic="selection"
      onPress={onPress}
      style={[
        styles.card,
        {
          borderColor,
          backgroundColor: bgColor,
        },
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={title}
    >
      {leading && <View style={styles.leadingWrap}>{leading}</View>}

      <View style={styles.contentWrap}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              {
                color: selected ? colors.primary : colors.textPrimary,
                fontWeight: selected ? '700' : '600',
              },
            ]}
          >
            {title}
          </Text>
          {trailingBadge && (
            <View
              style={[
                styles.badge,
                { backgroundColor: selected ? colors.primary + '20' : colors.componentBase },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: selected ? colors.primary : colors.textSecondary },
                ]}
              >
                {trailingBadge}
              </Text>
            </View>
          )}
        </View>

        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.radioOuter,
          {
            borderColor: selected ? colors.primary : colors.outlineGrey + '60',
            backgroundColor: selected ? colors.primary : 'transparent',
          },
        ]}
      >
        {selected && (
          <Animated.View entering={reducedMotion ? undefined : ZoomIn.duration(200)}>
            <Ionicons name="checkmark" size={14} color={colors.canvasPure} />
          </Animated.View>
        )}
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: 12,
    ...Shadows.card,
  },
  leadingWrap: {
    marginRight: 14,
  },
  contentWrap: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontFamilyDisplay,
    fontSize: Typography.fontSize.md,
  },
  subtitle: {
    fontFamily: Typography.fontFamilyBody,
    fontSize: Typography.fontSize.xs,
    marginTop: 3,
    lineHeight: 18,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

