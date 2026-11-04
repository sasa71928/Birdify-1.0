import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Typography, Spacing } from '../../theme';
import { CollapsibleHeader } from '../animated/CollapsibleHeader';

interface SettingsScaffoldProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  scrollContentStyle?: any;
}

export const SettingsScaffold: React.FC<SettingsScaffoldProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  children,
  scrollContentStyle,
}) => {
  const { colors, isDark } = useDynamicStyles();
  const scrollY = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const largeTitleAnimStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 35],
      [1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 35],
      [0, -8],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.surface }]}
      edges={['top']}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Fixed top bar */}
      <CollapsibleHeader
        title={title}
        onBack={onBack}
        rightAction={rightAction}
        scrollY={scrollY}
        scrollThreshold={35}
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, scrollContentStyle]}
      >
        {/* Large title area */}
        <Animated.View style={[styles.largeTitleBox, largeTitleAnimStyle]}>
          <Text
            style={[
              styles.largeTitle,
              { color: colors.textPrimary },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.largeSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </Animated.View>

        {/* Child items with subtle instantaneous entry */}
        <Animated.View
          entering={reducedMotion ? undefined : FadeInDown.duration(140)}
        >
          {children}
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  largeTitleBox: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  largeTitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  largeSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 4,
    lineHeight: 20,
  },
});

