/**
 * AppButton — Botón primario reutilizable
 */
import React from 'react';
import {
  Text,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Radius, Shadows } from '../theme';
import { PressableScale } from './animated/PressableScale';

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  color?: string;
  textColor?: string;
  fontSize?: number;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

import styles from '../styles/components/AppButton.styles';

export default function AppButton({
  label,
  onPress,
  color = Colors.primary,
  textColor = Colors.textOnPrimary,
  fontSize = Typography.fontSize.lg,
  disabled = false,
  loading = false,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      activeScale={0.98}
      haptic="light"
      style={[
        styles.button,
        { backgroundColor: disabled ? Colors.placeholder : color },
        Shadows.button,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor, fontSize }]}>
          {label}
        </Text>
      )}
    </PressableScale>
  );
}
