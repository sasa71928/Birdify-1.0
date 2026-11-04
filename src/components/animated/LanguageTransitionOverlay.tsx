import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useLanguage } from '../../i18n';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

export const LanguageTransitionOverlay: React.FC = () => {
  const { transition } = useLanguage();
  const { colors } = useDynamicStyles();

  const animStyle = useAnimatedStyle(() => {
    const val = transition ? transition.value : 0;
    return {
      opacity: val,
      // Hide completely when 0 so it doesn't intercept anything
      display: val === 0 ? 'none' : 'flex',
    };
  });

  if (!transition) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.surface, zIndex: 99999 },
        animStyle,
      ]}
    />
  );
};
