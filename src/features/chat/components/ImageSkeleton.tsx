import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius } from '../../../theme';

interface ImageSkeletonProps {
  width: number;
  height: number;
  borderRadius?: number;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  width,
  height,
  borderRadius = Radius.md,
}) => {
  const { colors, isDark } = useDynamicStyles();
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacityAnim]);

  const bgColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)';

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.componentBase,
        },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: bgColor,
            borderRadius,
            opacity: opacityAnim,
          },
        ]}
      />
      <Ionicons
        name="image-outline"
        size={Math.min(32, Math.round(width * 0.18))}
        color={colors.textSecondary}
        style={{ opacity: 0.35 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

