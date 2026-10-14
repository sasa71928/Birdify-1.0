import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface SkeletonBoneProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBone: React.FC<SkeletonBoneProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  const baseColor = isDark ? '#2C302C' : '#E2E8E0';

  return (
    <Animated.View
      style={[
        styles.bone,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: baseColor,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  bone: {
    overflow: 'hidden',
  },
});
