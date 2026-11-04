import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Typography, Spacing } from '../../theme';
import { PressableScale } from './PressableScale';

interface CollapsibleHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  scrollY?: SharedValue<number>;
  scrollThreshold?: number;
  style?: StyleProp<ViewStyle>;
  alwaysShowTitle?: boolean;
}

export const CollapsibleHeader: React.FC<CollapsibleHeaderProps> = ({
  title,
  onBack,
  rightAction,
  scrollY,
  scrollThreshold = 40,
  style,
  alwaysShowTitle = false,
}) => {
  const { colors, isDark } = useDynamicStyles();

  const titleAnimStyle = useAnimatedStyle(() => {
    if (!scrollY || alwaysShowTitle) {
      return { opacity: 1, transform: [{ translateY: 0 }] };
    }
    const opacity = interpolate(
      scrollY.value,
      [scrollThreshold - 15, scrollThreshold + 15],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [scrollThreshold - 15, scrollThreshold + 15],
      [10, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const borderAnimStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return { borderBottomColor: colors.border + '15' };
    }
    const opacity = interpolate(
      scrollY.value,
      [scrollThreshold - 10, scrollThreshold + 20],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      borderBottomColor: `rgba(${isDark ? '255,255,255' : '0,0,0'}, ${opacity * 0.08})`,
    };
  });

  return (
    <Animated.View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
        },
        borderAnimStyle,
        style,
      ]}
    >
      <View style={styles.left}>
        {onBack && (
          <PressableScale
            activeScale={0.98}
            haptic="light"
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Atrás"
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </PressableScale>
        )}
      </View>

      <Animated.View style={[styles.center, titleAnimStyle]}>
        <Text
          numberOfLines={1}
          style={[styles.headerTitle, { color: colors.textPrimary }]}
        >
          {title}
        </Text>
      </Animated.View>

      <View style={styles.right}>{rightAction ?? <View style={{ width: 36 }} />}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    height: 52,
  },
  left: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
});

