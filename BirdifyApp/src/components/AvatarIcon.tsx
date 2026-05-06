/**
 * AvatarIcon — Círculo con imagen o emoji/ícono de respaldo
 *
 * Props:
 *  imageSource  — require('../assets/icon.png') o { uri: 'https://...' }
 *  fallback     — emoji o texto si no hay imagen (default: '🕊️')
 *  size         — diámetro del círculo en px (default: 80)
 *  color        — color de fondo del círculo (default: Colors.primary)
 *  style        — estilos extra para el contenedor
 */
import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import { Colors, Radius, Shadows } from '../theme';

type AvatarIconProps = {
  imageSource?: ImageSourcePropType;
  fallback?: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
};

import styles from '../styles/AvatarIcon.styles';

export default function AvatarIcon({
  imageSource,
  fallback = '🕊️',
  size = 80,
  color = Colors.primary,
  style,
}: AvatarIconProps) {
  const circle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
  };

  return (
    <View style={[styles.base, circle, Shadows.card, style]}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={{ width: size * 0.6, height: size * 0.6 }}
          resizeMode="contain"
        />
      ) : (
        <Text style={{ fontSize: size * 0.42 }}>{fallback}</Text>
      )}
    </View>
  );
}
