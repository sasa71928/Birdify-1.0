import { StyleSheet } from 'react-native';
import { Radius, Typography } from '../../../theme';

export const createStyles = (colors: any) =>
  StyleSheet.create({
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: Radius.lg,
      borderWidth: 1.5,
    },
    deleteBtnText: {
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamilyDisplay,
      fontWeight: '700',
    },
    deleteWarning: {
      fontSize: Typography.fontSize.xs,
      fontFamily: Typography.fontFamilyBody,
      textAlign: 'center',
      marginTop: 10,
      lineHeight: 18,
      paddingHorizontal: 8,
    },
    dialogBody: {
      alignItems: 'center',
    },
    deleteIconBox: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    dialogTitle: {
      fontSize: Typography.fontSize.lg,
      fontFamily: Typography.fontFamilyDisplay,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 6,
    },
    dialogDesc: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamilyBody,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 16,
    },
    deleteBulletsBox: {
      width: '100%',
      padding: 14,
      borderRadius: Radius.md,
      marginBottom: 16,
    },
    bulletItem: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamilyBody,
      marginBottom: 4,
    },
    inputGroup: {
      width: '100%',
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: Typography.fontSize.xs,
      fontFamily: Typography.fontFamilyDisplay,
      fontWeight: '600',
      marginBottom: 6,
    },
    input: {
      width: '100%',
      height: 48,
      borderRadius: Radius.md,
      borderWidth: 1.5,
      paddingHorizontal: 14,
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamilyBody,
    },
    dialogActions: {
      flexDirection: 'row',
      width: '100%',
      gap: 12,
      marginTop: 6,
    },
    dialogBtn: {
      flex: 1,
      height: 46,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

