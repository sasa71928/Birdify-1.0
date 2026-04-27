/**
 * AppButton — Botón primario reutilizable
 *
 * Props:
 *  label      — texto del botón
 *  onPress    — callback al presionar
 *  color      — color de fondo (default: Colors.primary)
 *  textColor  — color del texto (default: Colors.textOnPrimary)
 *  fontSize   — tamaño de fuente (default: Typography.fontSize.lg)
 *  disabled   — deshabilita el botón
 *  style      — estilos adicionales para el contenedor
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Radius, Shadows } from '../theme';

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
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? Colors.placeholder : color },
        Shadows.button,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor, fontSize }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.lg,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
});
