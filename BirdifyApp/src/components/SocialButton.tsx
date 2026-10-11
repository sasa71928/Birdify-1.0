import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';

import { Shadows } from '../theme';
import { useDynamicStyles } from '../hooks/useDynamicStyles';
import { createStyles } from '../styles/components/SocialButton.styles';

type SocialButtonProps = {
  label: string;
  iconSymbol: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
};

export default function SocialButton({
  label,
  iconSymbol,
  onPress,
  style,
  disabled = false,
  loading = false,
}: SocialButtonProps) {

  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, Shadows.card, style, isDisabled && { opacity: 0.6 }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={`Continuar con ${label}`}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading
        ? <ActivityIndicator size="small" color={colors.textSecondary} />
        : typeof iconSymbol === 'string'
          ? <Text style={styles.icon}>{iconSymbol}</Text>
          : iconSymbol}

      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}