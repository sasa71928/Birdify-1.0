import { StyleSheet, Dimensions } from 'react-native';
import { Typography, Spacing, Radius, Shadows } from '../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 2 - GRID_GAP) / 2;

export const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    container: {
      flex: 1,
    },

    // Header de Guía de Campo
    fieldGuideHeader: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitlesWrap: {
      flex: 1,
      marginRight: Spacing.sm,
    },
    fieldGuideTitle: {
      fontSize: Typography.fontSize.xl,
      fontWeight: '800',
      fontFamily: Typography.fontFamilyDisplay,
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    countBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    countBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radius.full,
      backgroundColor: colors.primary + '18',
    },
    countBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      fontFamily: Typography.fontFamilyDisplay,
      color: colors.primary,
    },
    viewToggleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border + '30',
      backgroundColor: colors.componentBase,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Search Bar
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.componentBase,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.md,
      height: 46,
      marginHorizontal: Spacing.md,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
      borderWidth: 1,
      borderColor: colors.border + '25',
    },
    searchInput: {
      flex: 1,
      marginLeft: Spacing.sm,
      fontSize: Typography.fontSize.sm + 1,
      fontFamily: Typography.fontFamilyBody,
      color: colors.textPrimary,
      paddingVertical: 0,
    },
    clearSearchBtn: {
      padding: 4,
    },

    // Filters Bar
    filtersWrapper: {
      paddingVertical: Spacing.xs + 2,
    },
    filtersScroll: {
      paddingHorizontal: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: Radius.full,
      backgroundColor: colors.componentBase,
      borderWidth: 1,
      borderColor: colors.border + '25',
      gap: 6,
    },
    activeFilter: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      fontSize: 12.5,
      fontWeight: '600',
      fontFamily: Typography.fontFamilyBody,
      color: colors.textSecondary,
    },
    activeFilterText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    // List & Grid
    listContent: {
      paddingHorizontal: Spacing.md,
      paddingBottom: 120,
      paddingTop: Spacing.xs,
    },

    // Modo Cuadrícula (Grid)
    gridRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: GRID_GAP,
    },
    gridCard: {
      width: GRID_CARD_WIDTH,
      backgroundColor: colors.canvasPure,
      borderRadius: Radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border + '20',
      ...Shadows.card,
    },
    gridImageWrapper: {
      width: '100%',
      height: 135,
      position: 'relative',
      backgroundColor: colors.surfaceDim,
    },
    gridImage: {
      width: '100%',
      height: '100%',
    },
    gridInfo: {
      padding: 10,
      gap: 2,
    },
    gridBirdName: {
      fontSize: 13.5,
      fontWeight: '700',
      fontFamily: Typography.fontFamilyDisplay,
      color: colors.textPrimary,
      lineHeight: 18,
    },
    gridScientificName: {
      fontSize: 11,
      fontStyle: 'italic',
      fontFamily: Typography.fontFamilyBody,
      color: colors.textSecondary,
    },
    gridMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 4,
    },
    gridMetaText: {
      fontSize: 10.5,
      color: colors.textSecondary,
      flex: 1,
    },

    // Modo Lista (Row)
    listCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.canvasPure,
      borderRadius: Radius.lg,
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border + '20',
      gap: 12,
      ...Shadows.card,
    },
    listImageWrapper: {
      width: 68,
      height: 68,
      borderRadius: Radius.md,
      overflow: 'hidden',
      backgroundColor: colors.surfaceDim,
      position: 'relative',
    },
    listImage: {
      width: '100%',
      height: '100%',
    },
    listInfo: {
      flex: 1,
      gap: 2,
    },
    listBirdName: {
      fontSize: 15,
      fontWeight: '700',
      fontFamily: Typography.fontFamilyDisplay,
      color: colors.textPrimary,
    },
    listScientificName: {
      fontSize: 12,
      fontStyle: 'italic',
      fontFamily: Typography.fontFamilyBody,
      color: colors.textSecondary,
    },
    listTagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    miniTag: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: Radius.full,
      backgroundColor: colors.componentBase,
    },
    miniTagText: {
      fontSize: 10.5,
      fontWeight: '600',
      color: colors.textSecondary,
    },

    // Status Pill común
    statusPill: {
      position: 'absolute',
      top: 7,
      right: 7,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: Radius.full,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    statusPillResident: {
      backgroundColor: 'rgba(22, 101, 52, 0.88)',
    },
    statusPillMigratory: {
      backgroundColor: 'rgba(30, 64, 175, 0.88)',
    },
    statusPillText: {
      fontSize: 9.5,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // Section Header
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: Spacing.sm,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    sectionPill: {
      width: 4,
      height: 16,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.sm + 1,
      fontWeight: '800',
      fontFamily: Typography.fontFamilyDisplay,
      color: colors.textPrimary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    sectionCountBadge: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: Radius.full,
      backgroundColor: colors.border + '30',
    },
    sectionCountText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },

    // Empty State
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: Spacing.xl,
      gap: 12,
    },
    emptyIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.componentBase,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      fontFamily: Typography.fontFamilyDisplay,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 13.5,
      fontFamily: Typography.fontFamilyBody,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 19,
    },
    resetBtn: {
      marginTop: 8,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    resetBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
