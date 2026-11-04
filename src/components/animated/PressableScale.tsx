import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { haptics } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  haptic?: 'light' | 'selection' | 'medium' | 'none';
  children: React.ReactNode;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  style,
  activeScale = 0.98,
  haptic = 'none',
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  children,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: reducedMotion ? 1 : scale.value }],
    };
  });

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!disabled) {
      if (haptic === 'light') haptics.light();
      else if (haptic === 'selection') haptics.selection();
      else if (haptic === 'medium') haptics.medium();

      scale.value = withSpring(activeScale, {
        damping: 24,
        stiffness: 450,
        mass: 0.3,
      });
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, {
      damping: 24,
      stiffness: 450,
      mass: 0.3,
    });
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[style, animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
};

