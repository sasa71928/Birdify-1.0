import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { PressableScale } from '../animated/PressableScale';

interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
  size?: number;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  children,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  size = 44,
  style,
}) => {
  return (
    <PressableScale
      activeScale={0.98}
      haptic="light"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessible={true}
      disabled={disabled}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {children}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
