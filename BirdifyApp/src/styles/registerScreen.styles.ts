/**
 * registerScreen.styles.ts
 * Solo estilos específicos de RegisterScreen.
 * Los estilos comunes (header, card, divider, etc.) vienen de shared.styles.
 */
import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme';

const registerStyles = StyleSheet.create({
  // ── Hero ──────────────────────────────────────────────────────────────────
  heroTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.loose,
    letterSpacing: -0.5,
  },
});

export default registerStyles;
