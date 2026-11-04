import { StyleSheet } from 'react-native';
import { Radius, Spacing } from '../../../theme';

export const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },

    // Top Dedicated Navigation Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '18',
    },

    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.componentBase,
      borderWidth: 1,
      borderColor: colors.border + '25',
    },

    headerTitleWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    headerTitle: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textPrimary,
    },

    headerSubtitle: {
      fontSize: 11,
      fontFamily: 'PlusJakartaSans-Medium',
      color: colors.textSecondary,
      marginTop: 1,
    },

    cancelBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: Radius.full,
    },

    cancelBtnText: {
      fontSize: 13,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: colors.textSecondary,
    },

    scroll: {
      flex: 1,
    },

    content: {
      padding: Spacing.md,
      paddingBottom: 110,
    },

    // Edit limit warning banner
    bannerNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: Radius.lg,
      backgroundColor: '#FEF3C7',
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: '#FDE68A',
    },

    bannerNoticeText: {
      fontSize: 12.5,
      color: '#92400E',
      fontFamily: 'PlusJakartaSans-Medium',
      flex: 1,
    },

    // 1. Photo Hero Dropzone (Empty State)
    photoHeroEmpty: {
      borderWidth: 2,
      borderColor: colors.primary + '40',
      borderStyle: 'dashed',
      borderRadius: Radius.xl,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.componentBase,
      marginBottom: Spacing.md,
    },

    cameraIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },

    photoHeroTitle: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.primary,
      marginBottom: 4,
    },

    photoHeroSubtitle: {
      fontSize: 12.5,
      fontFamily: 'PlusJakartaSans-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },

    photoActionButtonsRow: {
      flexDirection: 'row',
      gap: 10,
    },

    photoActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border + '30',
    },

    photoActionBtnPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    photoActionBtnText: {
      fontSize: 12.5,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: colors.textPrimary,
    },

    photoActionBtnPrimaryText: {
      color: '#FFFFFF',
      fontFamily: 'PlusJakartaSans-Bold',
    },

    // 1. Photo Gallery Grid (when images exist)
    galleryContainer: {
      marginBottom: Spacing.md,
      backgroundColor: colors.componentBase,
      borderRadius: Radius.xl,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border + '20',
    },

    galleryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      paddingHorizontal: 2,
    },

    galleryTitle: {
      fontSize: 13.5,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textPrimary,
    },

    galleryCountPill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radius.full,
      backgroundColor: colors.primary + '18',
    },

    galleryCountText: {
      fontSize: 11,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.primary,
    },

    thumbnailHeroWrap: {
      width: '100%',
      aspectRatio: 1.6,
      borderRadius: Radius.lg,
      overflow: 'hidden',
      position: 'relative',
      marginBottom: 10,
      backgroundColor: colors.surfaceDim,
    },

    thumbnailGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    thumbnailWrap: {
      width: '31.3%',
      aspectRatio: 1,
      borderRadius: Radius.md,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: colors.surfaceDim,
    },

    thumbnailImage: {
      width: '100%',
      height: '100%',
    },

    removePhotoBtn: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    mainBadge: {
      position: 'absolute',
      bottom: 6,
      left: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },

    mainBadgeText: {
      fontSize: 10,
      fontFamily: 'PlusJakartaSans-Bold',
      color: '#FFFFFF',
    },

    addMoreCard: {
      width: '31.3%',
      aspectRatio: 1,
      borderRadius: Radius.md,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.primary + '50',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      gap: 4,
    },

    addMoreText: {
      fontSize: 11,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: colors.primary,
    },

    // Card Sections (Species, Notes, Location)
    cardSection: {
      backgroundColor: colors.componentBase,
      borderRadius: Radius.xl,
      padding: 14,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border + '20',
    },

    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },

    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    sectionTitle: {
      fontSize: 14,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textPrimary,
    },

    sectionSubtitle: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-Regular',
      color: colors.textSecondary,
      marginBottom: 10,
    },

    // 2. Selected Bird Card
    selectedBirdCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: 12,
      borderWidth: 1.5,
      borderColor: colors.primary + '60',
      gap: 12,
    },

    selectedBirdIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },

    selectedBirdContent: {
      flex: 1,
    },

    selectedBirdName: {
      fontSize: 15,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textPrimary,
    },

    selectedBirdSci: {
      fontSize: 12.5,
      fontFamily: 'PlusJakartaSans-Medium',
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 1,
    },

    changeBirdBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: Radius.full,
      backgroundColor: colors.componentBase,
      borderWidth: 1,
      borderColor: colors.border + '30',
    },

    changeBirdBtnText: {
      fontSize: 11.5,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: colors.primary,
    },

    // Search Input & Autocomplete Dropdown
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      paddingHorizontal: 12,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border + '40',
      gap: 8,
    },

    searchWrapperFocused: {
      borderColor: colors.primary,
    },

    searchInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'PlusJakartaSans-Medium',
      color: colors.textPrimary,
      paddingVertical: 0,
    },

    dropdownCard: {
      position: 'absolute',
      top: 54,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border + '35',
      zIndex: 50,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },

    dropdownItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '15',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    dropdownItemText: {
      fontSize: 14,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textPrimary,
    },

    dropdownItemSci: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-Regular',
      color: colors.textSecondary,
      fontStyle: 'italic',
    },

    // 3. Notes & Observation Tags
    notesInput: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: 12,
      minHeight: 90,
      fontSize: 14,
      fontFamily: 'PlusJakartaSans-Regular',
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border + '40',
    },

    observationTagsLabel: {
      fontSize: 11.5,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: colors.textSecondary,
      marginTop: 10,
      marginBottom: 6,
    },

    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },

    tagChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border + '30',
    },

    tagChipText: {
      fontSize: 11.5,
      fontFamily: 'PlusJakartaSans-Medium',
      color: colors.textSecondary,
    },

    // 4. Map & Location
    myLocationBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: Radius.full,
      backgroundColor: colors.primary + '18',
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },

    myLocationBtnText: {
      fontSize: 11.5,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.primary,
    },

    mapContainer: {
      height: 220,
      borderRadius: Radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border + '30',
      position: 'relative',
    },

    mapFloatingBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: Radius.full,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    mapFloatingText: {
      fontSize: 11,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: '#FFFFFF',
    },

    mapGpsFab: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 4,
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border + '25',
    },

    manualCoordsToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 8,
      alignSelf: 'flex-start',
      paddingVertical: 4,
    },

    manualCoordsToggleText: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-SemiBold',
      color: colors.primary,
    },

    coordsInputsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
    },

    coordInputWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radius.md,
      paddingHorizontal: 10,
      height: 40,
      borderWidth: 1,
      borderColor: colors.border + '35',
    },

    coordInputLabel: {
      fontSize: 11,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textSecondary,
      marginRight: 6,
    },

    coordTextInput: {
      flex: 1,
      fontSize: 12.5,
      color: colors.textPrimary,
      fontFamily: 'PlusJakartaSans-Medium',
      paddingVertical: 0,
    },

    // 5. Privacy Toggle Card
    privacyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.componentBase,
      borderRadius: Radius.xl,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border + '20',
      marginBottom: Spacing.lg,
    },

    privacyIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    privacyContent: {
      flex: 1,
      marginRight: 10,
    },

    privacyTitle: {
      fontSize: 14,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.textPrimary,
    },

    privacySubtitle: {
      fontSize: 11.5,
      fontFamily: 'PlusJakartaSans-Regular',
      color: colors.textSecondary,
      marginTop: 2,
    },

    // 6. Publish Button
    publishButton: {
      backgroundColor: colors.primary,
      height: 54,
      borderRadius: 27,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
      marginBottom: 20,
    },

    publishButtonText: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-Bold',
      color: '#FFFFFF',
    },
  });
