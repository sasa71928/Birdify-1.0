import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../theme';

export const createStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },

    // Search bar
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '22',
      backgroundColor: colors.surface,
      gap: Spacing.sm,
    },

    backBtn: {
      padding: 4,
    },

    inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.componentBase,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      height: 42,
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border + '33',
    },

    searchIcon: {
      marginRight: 2,
    },

    input: {
      flex: 1,
      fontSize: Typography.fontSize.md,
      color: colors.textPrimary,
      paddingVertical: 0,
    },

    filterBtn: {
      padding: 4,
    },

    // Scroll
    scroll: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.lg,
    },

    // Section
    section: {
      marginBottom: Spacing.xl,
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },

    sectionTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.primary,
      marginBottom: Spacing.md,
    },

    clearAll: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semiBold,
      color: colors.primary,
      marginBottom: Spacing.md,
    },

    // Recent searches
    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '22',
    },

    recentText: {
      flex: 1,
      fontSize: Typography.fontSize.md,
      color: colors.textPrimary,
      fontWeight: Typography.fontWeight.medium,
    },

    // Tabs
    tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.surface,
    },

    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: Radius.full,
      backgroundColor: colors.componentBase,
      borderWidth: 1,
      borderColor: colors.border + '33',
    },

    activeTab: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    tabText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semiBold,
      color: colors.textSecondary,
    },

    activeTabText: {
      color: colors.white,
    },

    // Resultados
    resultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      borderRadius: Radius.lg,
      backgroundColor: colors.componentBase,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border + '22',
    },

    resultImage: {
      width: 60,
      height: 60,
      borderRadius: Radius.md,
      marginRight: Spacing.md,
    },

    userAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: Spacing.md,
    },

    resultTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
    },

    resultSubtitle: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },

    emptyText: {
      color: colors.textSecondary,
      marginTop: Spacing.sm,
      fontSize: Typography.fontSize.sm,
    },
  });
