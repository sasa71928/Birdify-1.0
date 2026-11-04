import { StyleSheet } from 'react-native';
import { Typography, Spacing, Radius } from '../../../theme';

export const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    offlineText: {
      marginTop: 12,
      fontSize: 15,
      textAlign: 'center',
    },
    screenHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xs,
    },
    screenTitle: {
      fontSize: Typography.fontSize.xl,
      fontWeight: '800',
    },
    createGroupBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: Radius.full,
      gap: 6,
    },
    createGroupText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.sm,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: Radius.lg,
      borderWidth: 1,
      gap: 8,
    },
    searchPlaceholder: {
      fontSize: 14,
    },
    listWrap: {
      flex: 1,
    },
    threadItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: 12,
      borderBottomWidth: 1,
      gap: 12,
    },
    threadInfo: {
      flex: 1,
      gap: 3,
    },
    threadHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    threadName: {
      fontSize: 15,
      flex: 1,
      marginRight: 8,
    },
    threadTime: {
      fontSize: 11.5,
    },
    threadFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastMessageText: {
      fontSize: 13.5,
      flex: 1,
      marginRight: 8,
    },
    unreadBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    unreadBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    fab: {
      position: 'absolute',
      right: 18,
      zIndex: 50,
    },
    fabBtn: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginTop: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    emptyActionBtn: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: Radius.full,
      marginTop: 10,
    },
    emptyActionBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    sheetContent: {
      paddingVertical: 6,
      gap: 2,
    },
    sheetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      gap: 14,
    },
    sheetLabel: {
      fontSize: 15,
      fontWeight: '600',
    },
    modalSafe: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      gap: 12,
    },
    modalCloseBtn: {
      padding: 4,
    },
    modalHeaderTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    modalSearchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: Radius.md,
      borderWidth: 1,
      gap: 8,
    },
    modalInput: {
      flex: 1,
      fontSize: 14,
      padding: 0,
    },
    noUsersText: {
      marginTop: 10,
      fontSize: 14,
      textAlign: 'center',
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      gap: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 15,
      fontWeight: '700',
    },
    userHandle: {
      fontSize: 13,
      marginTop: 1,
    },
  });
