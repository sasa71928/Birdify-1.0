import { StyleSheet } from 'react-native';
import { Radius, Typography } from '../../../theme';

export const createStyles = (colors: any) =>
  StyleSheet.create({
    loadingWrap: {
      padding: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    formContainer: {
      paddingBottom: 20,
    },
    avatarSection: {
      alignItems: 'center',
      marginVertical: 16,
    },
    avatarBtn: {
      position: 'relative',
      marginBottom: 8,
    },
    avatarImage: {
      width: 104,
      height: 104,
      borderRadius: 52,
      borderWidth: 2,
    },
    uploadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 104,
      height: 104,
      borderRadius: 52,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    changePhotoText: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamilyDisplay,
      fontWeight: '700',
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: Typography.fontSize.xs,
      fontFamily: Typography.fontFamilyDisplay,
      fontWeight: '600',
      marginBottom: 6,
    },
    bioHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    charCount: {
      fontSize: Typography.fontSize.xs,
      fontFamily: Typography.fontFamilyBody,
    },
    input: {
      width: '100%',
      height: 50,
      borderRadius: Radius.md,
      borderWidth: 1.5,
      paddingHorizontal: 14,
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamilyBody,
    },
    bioInput: {
      height: 110,
      paddingTop: 12,
      textAlignVertical: 'top',
    },
    saveBtn: {
      height: 52,
      borderRadius: Radius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
    },
    saveBtnText: {
      color: '#FFF',
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamilyDisplay,
      fontWeight: '700',
    },
    sheetBody: {
      paddingBottom: 16,
    },
    sheetTitle: {
      fontSize: Typography.fontSize.lg,
      fontFamily: Typography.fontFamilyDisplay,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 4,
    },
    sheetDesc: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamilyBody,
      textAlign: 'center',
      marginBottom: 18,
    },
    sheetOptions: {
      gap: 12,
    },
    sheetOptionBtn: {
      flexDirection: 'row',
      height: 50,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetOptionText: {
      color: '#FFF',
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamilyDisplay,
      fontWeight: '600',
    },
  });

