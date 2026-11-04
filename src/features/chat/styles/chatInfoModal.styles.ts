import { StyleSheet, Dimensions } from 'react-native';
import { Radius, Typography } from '../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const PHOTO_GAP = 8;
export const PHOTO_SIZE = (SCREEN_WIDTH - 32 - PHOTO_GAP * 2) / 3;

export const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    topBar: {
      height: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      borderBottomWidth: 1,
    },
    closeBtn: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topBarTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: '700',
      fontFamily: Typography.fontFamilyBody,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    heroSection: {
      alignItems: 'center',
      paddingTop: 24,
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    heroTitle: {
      fontSize: Typography.fontSize.xl,
      fontWeight: '800',
      fontFamily: Typography.fontFamilyBody,
      marginTop: 14,
      textAlign: 'center',
    },
    heroSubtitle: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamilyBody,
      marginTop: 4,
      textAlign: 'center',
    },
    usernameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    descBox: {
      width: '100%',
      padding: 12,
      borderRadius: Radius.md,
      borderWidth: 1,
      marginTop: 14,
    },
    descText: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamilyBody,
      lineHeight: 20,
      textAlign: 'center',
    },
    actionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 18,
      justifyContent: 'center',
    },
    actionPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: Radius.full,
      borderWidth: 1,
    },
    actionPillText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      fontFamily: Typography.fontFamilyBody,
    },
    sectionDivider: {
      height: 8,
      marginVertical: 8,
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    sectionTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: '700',
      fontFamily: Typography.fontFamilyBody,
    },
    countBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radius.full,
    },
    countBadgeText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
      fontFamily: Typography.fontFamilyBody,
    },
    loadingBox: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    emptyMediaBox: {
      padding: 24,
      borderRadius: Radius.md,
      borderWidth: 1,
      alignItems: 'center',
      gap: 8,
    },
    emptyMediaText: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamilyBody,
    },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: PHOTO_GAP,
    },
    photoCell: {
      width: PHOTO_SIZE,
      height: PHOTO_SIZE,
      borderRadius: Radius.sm,
      overflow: 'hidden',
    },
    photoThumb: {
      width: '100%',
      height: '100%',
    },
    membersList: {
      gap: 8,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: Radius.md,
      borderWidth: 1,
      gap: 12,
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: Typography.fontSize.sm + 1,
      fontWeight: '700',
      fontFamily: Typography.fontFamilyBody,
    },
    memberUsername: {
      fontSize: Typography.fontSize.xs,
      fontFamily: Typography.fontFamilyBody,
      marginTop: 1,
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: Radius.sm,
    },
    roleText: {
      fontSize: 11,
      fontWeight: '700',
      fontFamily: Typography.fontFamilyBody,
    },
    infoCard: {
      padding: 14,
      borderRadius: Radius.md,
      borderWidth: 1,
      gap: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamilyBody,
    },
    infoValue: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      fontFamily: Typography.fontFamilyBody,
    },
  });

