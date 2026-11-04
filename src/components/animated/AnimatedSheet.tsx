import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Radius, Shadows } from '../../theme';

interface AnimatedSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showHandle?: boolean;
  position?: 'bottom' | 'top';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AnimatedSheet: React.FC<AnimatedSheetProps> = ({
  visible,
  onClose,
  children,
  showHandle = true,
  position = 'bottom',
}) => {
  const { colors } = useDynamicStyles();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  const isTop = position === 'top';
  const hiddenY = isTop ? -SCREEN_HEIGHT : SCREEN_HEIGHT;

  const translateY = useSharedValue(hiddenY);
  const backdropOpacity = useSharedValue(0);

  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      if (reducedMotion) {
        translateY.value = 0;
        backdropOpacity.value = 1;
      } else {
        backdropOpacity.value = withTiming(1, { duration: 160 });
        translateY.value = withSpring(0, {
          damping: 28,
          stiffness: 420,
          mass: 0.5,
        });
      }
    } else if (mounted) {
      const dismissDone = () => {
        setMounted(false);
      };
      if (reducedMotion) {
        translateY.value = hiddenY;
        backdropOpacity.value = 0;
        setMounted(false);
      } else {
        backdropOpacity.value = withTiming(0, { duration: 120 });
        translateY.value = withTiming(hiddenY, { duration: 160 }, (finished) => {
          if (finished) {
            runOnJS(dismissDone)();
          }
        });
      }
    }
  }, [visible, reducedMotion, hiddenY]);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (isTop) {
        if (event.translationY < 0) {
          translateY.value = event.translationY;
        }
      } else {
        if (event.translationY > 0) {
          translateY.value = event.translationY;
        }
      }
    })
    .onEnd((event) => {
      if (isTop) {
        if (event.translationY < -100 || event.velocityY < -500) {
          translateY.value = withTiming(hiddenY, { duration: 160 }, (finished) => {
            if (finished) {
              runOnJS(onClose)();
            }
          });
          backdropOpacity.value = withTiming(0, { duration: 120 });
        } else {
          translateY.value = withSpring(0, { damping: 28, stiffness: 420, mass: 0.5 });
        }
      } else {
        if (event.translationY > 120 || event.velocityY > 600) {
          translateY.value = withTiming(hiddenY, { duration: 160 }, (finished) => {
            if (finished) {
              runOnJS(onClose)();
            }
          });
          backdropOpacity.value = withTiming(0, { duration: 120 });
        } else {
          translateY.value = withSpring(0, { damping: 28, stiffness: 420, mass: 0.5 });
        }
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value * 0.5,
    };
  });

  if (!mounted && !visible) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          { justifyContent: isTop ? 'flex-start' : 'flex-end' },
        ]}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.surface,
                  paddingTop: isTop ? Math.max(insets.top + 8, 20) : 10,
                  paddingBottom: isTop ? 12 : Math.max(insets.bottom, 20),
                  borderTopLeftRadius: isTop ? 0 : Radius.xl,
                  borderTopRightRadius: isTop ? 0 : Radius.xl,
                  borderBottomLeftRadius: isTop ? Radius.xl : 0,
                  borderBottomRightRadius: isTop ? Radius.xl : 0,
                },
                sheetAnimatedStyle,
              ]}
            >
              {showHandle && !isTop && (
                <View style={styles.handleContainer}>
                  <View
                    style={[
                      styles.handle,
                      { backgroundColor: colors.border + '50' },
                    ]}
                  />
                </View>
              )}
              {children}
              {showHandle && isTop && (
                <View style={[styles.handleContainer, { paddingTop: 12, paddingBottom: 6 }]}>
                  <View
                    style={[
                      styles.handle,
                      { backgroundColor: colors.border + '50' },
                    ]}
                  />
                </View>
              )}
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  keyboardWrap: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...Shadows.modal,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
});
