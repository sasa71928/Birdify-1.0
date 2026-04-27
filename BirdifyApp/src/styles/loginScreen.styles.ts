/**
 * loginScreen.styles.ts
 * Solo estilos específicos de LoginScreen.
 * Los estilos comunes (header, card, divider, etc.) vienen de shared.styles.
 */
import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

const loginStyles = StyleSheet.create({
  // ── Hero (título en verde, diferente al registro) ──────────────────────────
  heroTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.primary,          // verde en login, negro en registro
    textAlign: 'center',
    lineHeight: Typography.lineHeight.loose,
    letterSpacing: -0.5,
  },

  // ── Link "¿Olvidaste tu contraseña?" ──────────────────────────────────────
  forgotLink: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.accent,
  },

  // ── Recordarme ────────────────────────────────────────────────────────────
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: 4,
    marginRight: Spacing.sm,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
  },
  rememberText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },

  // ── Pie legal ─────────────────────────────────────────────────────────────
  legalText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: Typography.lineHeight.tight,
    paddingHorizontal: Spacing.sm,
  },
  legalLink: {
    color: Colors.accent,
    textDecorationLine: 'underline',
    fontWeight: Typography.fontWeight.medium,
  },
});

export default loginStyles;
