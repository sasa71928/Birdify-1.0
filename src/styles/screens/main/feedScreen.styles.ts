import { StyleSheet } from 'react-native';
import { Typography, Spacing, Radius, Shadows } from '../../../theme';

export const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    container: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      paddingBottom: 110, // Space for BottomNavBar
    },
    newPostsBanner: {
      position: 'absolute',
      top: 10,
      alignSelf: 'center',
      backgroundColor: colors.primary,
      borderRadius: Radius.full,
      paddingVertical: 10,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      zIndex: 9999,
      ...Shadows.modal,
    },
    newPostsBannerText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 13,
      fontFamily: Typography.fontFamilyDisplay,
    },
    headerDivider: {
      height: 1,
      backgroundColor: colors.border + '15',
    },
  });
