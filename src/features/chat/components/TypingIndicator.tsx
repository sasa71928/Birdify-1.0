import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius } from '../../../theme';

export const TypingIndicator: React.FC = () => {
  const { colors } = useDynamicStyles();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnim = (val: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: -5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(600 - delay),
        ])
      );
    };

    const anim1 = createAnim(dot1, 0);
    const anim2 = createAnim(dot2, 180);
    const anim3 = createAnim(dot3, 360);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.bubbleTheirs,
            borderColor: colors.bubbleBorder,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.primary, transform: [{ translateY: dot1 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.primary, transform: [{ translateY: dot2 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.primary, transform: [{ translateY: dot3 }] },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

