import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../theme';

export const createStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },

    // Header & Search Bar
    headerContainer: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '18',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.sm,
    },

    searchBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },

    backBtn: {
      width: 42,
      height: 42,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.componentBase,
      borderWidth: 1,
      borderColor: colors.border + '25',
    },

    inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.componentBase,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      height: 44,
      gap: 8,
      borderWidth: 1.5,
      borderColor: colors.border + '33',
    },

    inputWrapperFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },

    searchIcon: {
      marginRight: 2,
    },

    input: {
      flex: 1,
      fontSize: Typography.fontSize.md,
      color: colors.textPrimary,
      paddingVertical: 0,
      fontFamily: 'PlusJakartaSans-Medium',
    },

    clearBtn: {
      padding: 4,
    },

    // Segmented Category Tabs
    tabsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      gap: Spacing.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '12',
    },

    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderRadius: Radius.full,
      backgroundColor: colors.componentBase,
      borderWidth: 1,
      borderColor: colors.border + '22',
      gap: 6,
    },

    activeTab: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },

    tabText: {
      fontSize: Typography.fontSize.sm,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: colors.textSecondary,
    },

    activeTabText: {
      color: '#FFFFFF',
      fontFamily: 'PlusJakartaSans-Bold',
    },

    tabBadge: {
      paddingHorizontal: 7,
      paddingVertical: 1,
      borderRadius: Radius.full,
      backgroundColor: colors.border + '30',
    },

    activeTabBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.28)',
    },

    tabBadgeText: {
      fontSize: 11,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textSecondary,
    },

    activeTabBadgeText: {
      color: '#FFFFFF',
    },

    // Quick Bird Filters (Resident / Migratory)
    quickFiltersContainer: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.md,
      paddingVertical: 8,
      gap: 8,
      backgroundColor: colors.surface,
    },

    filterChip: {
      paddingHorizontal: 13,
      paddingVertical: 5,
      borderRadius: Radius.full,
      backgroundColor: colors.componentBase,
      borderWidth: 1,
      borderColor: colors.border + '25',
    },

    activeFilterChip: {
      backgroundColor: colors.primary + '18',
      borderColor: colors.primary,
    },

    filterChipText: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-Medium',
      color: colors.textSecondary,
    },

    activeFilterChipText: {
      color: colors.primary,
      fontFamily: 'PlusJakartaSans-Bold',
    },

    // Scroll
    scroll: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.xxl + 24,
    },

    // Section
    section: {
      marginBottom: Spacing.lg + 4,
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm + 2,
    },

    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    sectionTitle: {
      fontSize: 15,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textPrimary,
    },

    clearAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 6,
    },

    clearAllText: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: colors.primary,
    },

    // Recent Searches
    recentList: {
      gap: 6,
    },

    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: Radius.lg,
      backgroundColor: colors.componentBase,
      borderWidth: 1,
      borderColor: colors.border + '18',
      gap: 10,
    },

    recentText: {
      flex: 1,
      fontSize: Typography.fontSize.sm + 1,
      color: colors.textPrimary,
      fontFamily: 'PlusJakartaSans-Medium',
    },

    removeRecentBtn: {
      padding: 4,
    },

    // Trending / Suggested quick chips
    trendingWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },

    trendingChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: Radius.full,
      backgroundColor: colors.componentBase,
      borderWidth: 1,
      borderColor: colors.border + '25',
      gap: 6,
    },

    trendingChipText: {
      fontSize: 13,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: colors.textPrimary,
    },

    // Result Cards
    resultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: Radius.xl,
      backgroundColor: colors.componentBase,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border + '20',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },

    birdImage: {
      width: 68,
      height: 68,
      borderRadius: Radius.lg,
      backgroundColor: colors.surfaceDim,
    },

    userAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surfaceDim,
    },

    cardContent: {
      flex: 1,
      justifyContent: 'center',
      gap: 2,
    },

    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    resultTitle: {
      fontSize: 15,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textPrimary,
    },

    resultSubtitle: {
      fontSize: 13,
      fontFamily: 'PlusJakartaSans-Medium',
      color: colors.textSecondary,
      fontStyle: 'italic',
    },

    userHandle: {
      fontSize: 13,
      fontFamily: 'PlusJakartaSans-Medium',
      color: colors.textSecondary,
    },

    userBio: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-Regular',
      color: colors.textSecondary + 'cc',
      marginTop: 2,
    },

    badgesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },

    statusBadgeText: {
      fontSize: 10,
      fontFamily: 'PlusJakartaSans-Bold',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },

    habitatBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: colors.border + '18',
    },

    habitatBadgeText: {
      fontSize: 10,
      fontFamily: 'PlusJakartaSans-Medium',
      color: colors.textSecondary,
    },

    // Card Action Buttons
    cardActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      flexWrap: 'wrap',
    },

    cardActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border + '25',
    },

    cardActionPrimaryButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    cardActionButtonText: {
      fontSize: 11,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: colors.textSecondary,
    },

    cardActionPrimaryText: {
      color: '#FFFFFF',
      fontFamily: 'PlusJakartaSans-Bold',
    },

    chevronCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border + '20',
    },

    // Empty State
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 44,
      paddingHorizontal: 28,
      gap: 10,
    },

    emptyIconCircle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.primary + '14',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },

    emptyTitle: {
      fontSize: 17,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textPrimary,
      textAlign: 'center',
    },

    emptySubtitle: {
      fontSize: 13,
      fontFamily: 'PlusJakartaSans-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 19,
    },

    emptyResetBtn: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
    },

    emptyResetBtnText: {
      fontSize: 13,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: '#FFFFFF',
    },

    // Skeletons
    skeletonCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: Radius.xl,
      backgroundColor: colors.componentBase,
      marginBottom: 10,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border + '15',
    },

    skeletonImage: {
      width: 68,
      height: 68,
      borderRadius: Radius.lg,
      backgroundColor: colors.surfaceDim,
    },

    skeletonTextLarge: {
      width: '65%',
      height: 14,
      borderRadius: 6,
      backgroundColor: colors.surfaceDim,
      marginBottom: 6,
    },

    skeletonTextSmall: {
      width: '45%',
      height: 10,
      borderRadius: 6,
      backgroundColor: colors.surfaceDim,
    },
  });
