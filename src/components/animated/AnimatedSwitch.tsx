import React, { useEffect } from 'react';
import { StyleSheet, Pressable, AccessibilityProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useReducedMotion,
} from 'react-native-reanimated';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { haptics } from '../../utils/haptics';

interface AnimatedSwitchProps extends AccessibilityProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
}

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const PADDING = 3;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - PADDING * 2;

export const AnimatedSwitch: React.FC<AnimatedSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  activeColor,
  inactiveColor,
  thumbColor,
  accessibilityLabel,
  ...a11yProps
}) => {
  const { colors, isDark } = useDynamicStyles();
  const reducedMotion = useReducedMotion();

  const primaryColor = activeColor || colors.primary;
  const offColor = inactiveColor || (isDark ? '#3A3A3C' : '#E5E5EA');
  const ballColor = thumbColor || colors.canvasPure;

  const progress = useSharedValue(value ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = value ? 1 : 0;
    } else {
      progress.value = withSpring(value ? 1 : 0, {
        damping: 26,
        stiffness: 450,
        mass: 0.3,
      });
    }
  }, [value, reducedMotion]);

  const trackStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(progress.value, [0, 1], [offColor, primaryColor]);
    return {
      backgroundColor: bg,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: progress.value * TRAVEL },
        { scale: scale.value },
      ],
    };
  });

  const handlePress = () => {
    if (disabled) return;
    haptics.light();
    scale.value = withSpring(1.15, { damping: 10, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 350 });
    });
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, disabled && { opacity: 0.5 }]}
      {...a11yProps}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, { backgroundColor: ballColor }, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: PADDING,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
});

