import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';

import { Shadows } from '../theme';
import { useDynamicStyles } from '../hooks/useDynamicStyles';
import { createStyles } from '../styles/components/SocialButton.styles';

type SocialButtonProps = {
  label: string;
  iconSymbol: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function SocialButton({
  label,
  iconSymbol,
  onPress,
  style,
}: SocialButtonProps) {

  const { screen: styles } = useDynamicStyles(createStyles);

  return (
    <TouchableOpacity
      style={[styles.button, Shadows.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {typeof iconSymbol === 'string'
        ? <Text style={styles.icon}>{iconSymbol}</Text>
        : iconSymbol}

      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}