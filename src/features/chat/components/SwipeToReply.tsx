import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';

interface SwipeToReplyProps {
  children: React.ReactNode;
  onSwipe: () => void;
  isMine: boolean;
}

const SWIPE_THRESHOLD = 50;
const MAX_TRANSLATE = 70;

export const SwipeToReply: React.FC<SwipeToReplyProps> = React.memo(
  ({ children, onSwipe, isMine }) => {
    const { colors } = useDynamicStyles();
    const translateX = useRef(new Animated.Value(0)).current;
    const hasTriggeredHaptic = useRef(false);

    const onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: translateX } }],
      {
        useNativeDriver: true,
        listener: (event: any) => {
          const dx = event.nativeEvent.translationX;
          const absDx = Math.abs(dx);
          if (absDx > SWIPE_THRESHOLD && !hasTriggeredHaptic.current) {
            hasTriggeredHaptic.current = true;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
      }
    );

    const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
      if (
        event.nativeEvent.state === State.END ||
        event.nativeEvent.state === State.CANCELLED ||
        event.nativeEvent.state === State.FAILED
      ) {
        const dx = event.nativeEvent.translationX;
        const condition = isMine ? dx < -SWIPE_THRESHOLD : dx > SWIPE_THRESHOLD;

        if (condition) {
          onSwipe();
        }

        hasTriggeredHaptic.current = false;
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
        }).start();
      }
    };

    const clampedTranslateX = translateX.interpolate({
      inputRange: isMine ? [-MAX_TRANSLATE, 0] : [0, MAX_TRANSLATE],
      outputRange: isMine ? [-MAX_TRANSLATE, 0] : [0, MAX_TRANSLATE],
      extrapolate: 'clamp',
    });

    const iconOpacity = translateX.interpolate({
      inputRange: isMine ? [-SWIPE_THRESHOLD, -15, 0] : [0, 15, SWIPE_THRESHOLD],
      outputRange: isMine ? [1, 0.4, 0] : [0, 0.4, 1],
      extrapolate: 'clamp',
    });

    return (
      <PanGestureHandler
        activeOffsetX={isMine ? [-15, 1000] : [-1000, 15]}
        failOffsetY={[-15, 15]}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View style={styles.container}>
          <Animated.View
            style={[
              styles.iconWrapper,
              isMine ? styles.iconRight : styles.iconLeft,
              { opacity: iconOpacity },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="arrow-undo" size={16} color={colors.primary} />
            </View>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateX: clampedTranslateX }] }}>
            {children}
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconLeft: {
    left: 8,
  },
  iconRight: {
    right: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

