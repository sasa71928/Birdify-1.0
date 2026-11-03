import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius } from '../../../theme';

export const ChatSkeleton: React.FC = () => {
  const { colors, isDark } = useDynamicStyles();
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacityAnim]);

  const bubbleMine = colors.primary + (isDark ? '30' : '20');
  const bubbleTheirs = colors.componentBase;
  const avatarBg = colors.border + (isDark ? '40' : '30');

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      {/* Mensaje ajeno 1 */}
      <View style={styles.theirsRow}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]} />
        <View
          style={[
            styles.bubble,
            styles.theirsBubble,
            { width: 190, height: 42, backgroundColor: bubbleTheirs },
          ]}
        />
      </View>

      {/* Mensaje mío 1 */}
      <View style={styles.mineRow}>
        <View
          style={[
            styles.bubble,
            styles.mineBubble,
            { width: 230, height: 52, backgroundColor: bubbleMine },
          ]}
        />
      </View>

      {/* Mensaje ajeno 2 con imagen simulada */}
      <View style={styles.theirsRow}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]} />
        <View
          style={[
            styles.bubble,
            styles.theirsBubble,
            { width: 210, height: 140, backgroundColor: bubbleTheirs },
          ]}
        />
      </View>

      {/* Mensaje mío 2 */}
      <View style={styles.mineRow}>
        <View
          style={[
            styles.bubble,
            styles.mineBubble,
            { width: 150, height: 38, backgroundColor: bubbleMine },
          ]}
        />
      </View>

      {/* Mensaje ajeno 3 corto */}
      <View style={styles.theirsRow}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]} />
        <View
          style={[
            styles.bubble,
            styles.theirsBubble,
            { width: 130, height: 38, backgroundColor: bubbleTheirs },
          ]}
        />
      </View>

      {/* Mensaje mío 3 */}
      <View style={styles.mineRow}>
        <View
          style={[
            styles.bubble,
            styles.mineBubble,
            { width: 190, height: 42, backgroundColor: bubbleMine },
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 12,
    justifyContent: 'flex-end',
  },
  theirsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  mineRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  bubble: {
    borderRadius: Radius.lg,
  },
  theirsBubble: {
    borderBottomLeftRadius: 4,
  },
  mineBubble: {
    borderBottomRightRadius: 4,
  },
});
