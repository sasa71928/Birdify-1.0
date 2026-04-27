/**
 * SocialButton — Botón de login social reutilizable
 *
 * Props:
 *  label       — texto ("Google", "Apple", etc.)
 *  iconSymbol  — emoji o string corto como ícono
 *  onPress     — callback
 *  style       — estilos adicionales
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

type SocialButtonProps = {
  label: string;
  iconSymbol: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function SocialButton({
  label,
  iconSymbol,
  onPress,
  style,
}: SocialButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, Shadows.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{iconSymbol}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    height: 46,
    gap: Spacing.xs,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },
});
