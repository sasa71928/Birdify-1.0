import { StyleSheet } from 'react-native';
import { Radius, Spacing } from '../../../theme';

export const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      gap: 12,
    },
    backBtn: {
      padding: 4,
    },
    headerTitleWrap: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
    },
    headerSubtitle: {
      fontSize: 12,
      marginTop: 1,
    },
    nextBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: Radius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    nextBtnText: {
      fontSize: 13,
      fontWeight: '700',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailsScroll: {
      padding: Spacing.md,
    },
    avatarPickerSection: {
      alignItems: 'center',
      marginVertical: 20,
      gap: 10,
    },
    avatarTouch: {
      width: 90,
      height: 90,
      borderRadius: 45,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      overflow: 'hidden',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
    },
    avatarHint: {
      fontSize: 13,
      fontWeight: '500',
    },
    formCard: {
      borderRadius: Radius.lg,
      borderWidth: 1,
      overflow: 'hidden',
      marginTop: 8,
    },
    inputFieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    formInput: {
      flex: 1,
      fontSize: 15,
      padding: 0,
    },
    fieldDivider: {
      height: 1,
      marginLeft: 48,
    },
  });

