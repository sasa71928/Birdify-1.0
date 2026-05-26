import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../theme';

export const createStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Hero
    hero: {
      margin: Spacing.sm,
      height: 260,
      position: 'relative',
      paddingVertical: 0,
      paddingHorizontal: 0,
      backgroundColor: colors.componentBase,
      borderRadius: Radius.lg,
    },

    backBtn: {
      position: 'absolute',
      top: Spacing.md,
      left: Spacing.md,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },

    heroImageContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.componentBase,
      borderRadius: Radius.lg,
      overflow: 'hidden',
    },

    heroImage: {
      width: '100%',
      height: '100%',
      borderRadius: Radius.lg,
    },

    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },

    heroContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      paddingHorizontal: 10,
      backgroundColor: colors.componentBase + 'CC',
      borderBottomLeftRadius: Radius.lg,
      borderBottomRightRadius: Radius.lg,
      paddingVertical: Spacing.sm,
      width: '100%',
    },

    heroName: {
      fontSize: Typography.fontSize.xxl,
      fontWeight: Typography.fontWeight.extraBold,
      color: colors.textPrimary,
      lineHeight: 38,
    },

    heroScientific: {
      fontSize: Typography.fontSize.sm,
      fontStyle: 'italic',
      color: colors.primary,
      marginTop: 2,
    },

    // Card
    card: {
      backgroundColor: colors.canvasPure,
      marginHorizontal: Spacing.md,
      marginTop: Spacing.md,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadows.card,
    },

    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },

    cardTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
    },

    classGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    classCell: {
      width: '33.33%',
      paddingVertical: Spacing.sm,
      paddingRight: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    classCellLabel: {
      fontSize: 9,
      fontWeight: Typography.fontWeight.bold,
      color: colors.outlineGrey,
      letterSpacing: 0.8,
      marginBottom: 2,
    },

    classCellValue: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semiBold,
      color: colors.textPrimary,
      fontStyle: 'italic',
    },

    // Section
    section: {
      marginHorizontal: Spacing.md,
      marginTop: Spacing.lg,
    },

    sectionTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: Spacing.md,
    },

    overviewText: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: Spacing.md,
    },

    // Info blocks
    infoBlock: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.componentBase,
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },

    infoIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },

    infoBlockText: {
      flex: 1,
    },

    infoBlockTitle: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: 2,
    },

    infoBlockBody: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },

    // Sightings
    sightingsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },

    viewAll: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semiBold,
      color: colors.primary,
    },

    sightingCard: {
      backgroundColor: colors.canvasPure,
      borderRadius: Radius.lg,
      overflow: 'hidden',
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadows.card,
    },

    sightingAuthorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      gap: Spacing.sm,
    },

    sightingAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.componentBase,
    },

    sightingUser: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
    },

    sightingMeta: {
      fontSize: Typography.fontSize.xs,
      color: colors.textSecondary,
    },

    sightingImage: {
      width: '100%',
      height: 200,
    },

    sightingActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.canvasPure,
    },

    sightingActionGroup: {
      flexDirection: 'row',
      gap: Spacing.md,
    },

    sightingAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    sightingActionText: {
      fontSize: Typography.fontSize.sm,
      color: colors.textPrimary,
      fontWeight: Typography.fontWeight.medium,
    },
  });