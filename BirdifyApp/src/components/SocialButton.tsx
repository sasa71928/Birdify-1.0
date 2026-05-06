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
  iconSymbol: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

import styles from '../styles/SocialButton.styles';

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
      {typeof iconSymbol === 'string' ? <Text style={styles.icon}>{iconSymbol}</Text> : iconSymbol}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}
