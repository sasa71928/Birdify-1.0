/**
 * shared.styles.ts
 * Estilos comunes reutilizables por cualquier pantalla.
 * Importa desde aquí en lugar de redefinir en cada pantalla.
 */
import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

export const createSharedStyles = (colors: typeof Colors) => StyleSheet.create({
  // ── Contenedor raíz ────────────────────────────────────────────────────────
  safe: {
    flex: 1,
    paddingBottom: Spacing.md,
    backgroundColor: colors.surface,
  },

  // ── Header (logo + nombre) ─────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: colors.surface,
  },
  logoIcon: {
    fontSize: 22,
    marginRight: Spacing.xs,
  },
  logoText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  headerDivider: {
    height: 1.5,
    backgroundColor: colors.headerBorder,
    opacity: 0.6,
  },

  // ── ScrollView ─────────────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    margin: 0,
  },

  // ── Hero ───────────────────────────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: Typography.lineHeight.normal,
  },

  // ── Tarjeta ────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    ...Shadows.card,
  },

  // ── Divisor "O continuar con" ──────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: colors.textSecondary,
    marginHorizontal: Spacing.sm,
  },

  // ── Fila de botones sociales ───────────────────────────────────────────────
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  // ── Fila inferior de navegación (link) ────────────────────────────────────
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  navText: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
  },
  navLink: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: colors.accent,
  },
  navArrow: {
    fontSize: Typography.fontSize.sm,
    color: colors.accent,
    fontWeight: Typography.fontWeight.bold,
  },
  keyboardView: {
    flex: 1,
    paddingTop: Spacing.lg,
    backgroundColor: colors.transparent
  }
});
