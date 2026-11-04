import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  useReducedMotion,
} from 'react-native-reanimated';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Radius, Shadows } from '../../theme';

interface AnimatedDialogProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dismissible?: boolean;
  maxWidth?: number;
}

export const AnimatedDialog: React.FC<AnimatedDialogProps> = ({
  visible,
  onClose,
  children,
  dismissible = true,
  maxWidth = 380,
}) => {
  const { colors } = useDynamicStyles();
  const reducedMotion = useReducedMotion();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (dismissible) onClose();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Backdrop */}
        <Animated.View
          entering={reducedMotion ? undefined : FadeIn.duration(150)}
          exiting={reducedMotion ? undefined : FadeOut.duration(100)}
          style={styles.backdrop}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (dismissible) onClose();
            }}
          />
        </Animated.View>

        {/* Content Box */}
        <Animated.View
          entering={reducedMotion ? undefined : ZoomIn.duration(150)}
          exiting={reducedMotion ? undefined : ZoomOut.duration(100)}
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surface,
              maxWidth,
              borderColor: colors.border + '30',
            },
          ]}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  dialog: {
    width: '100%',
    borderRadius: Radius.xl,
    padding: 24,
    borderWidth: 1,
    ...Shadows.modal,
    zIndex: 10,
  },
});
