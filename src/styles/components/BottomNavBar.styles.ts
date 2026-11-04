import { StyleSheet } from 'react-native';
import { Radius, Spacing } from '../../theme';

export const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: Radius.xl + 6,
      borderTopRightRadius: Radius.xl + 6,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.border + '18',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 12,
    },

    innerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: Spacing.xs,
      paddingTop: 6,
    },

    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      paddingVertical: 4,
      position: 'relative',
    },

    navItemInner: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },

    iconContainer: {
      position: 'relative',
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },

    navText: {
      fontSize: 10.5,
      fontFamily: 'PlusJakartaSans-Medium',
      color: colors.textSecondary,
      marginTop: 2,
      letterSpacing: 0.1,
    },

    activeText: {
      fontSize: 10.5,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.primary,
      marginTop: 2,
      letterSpacing: 0.1,
    },

    activeIndicatorDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
      marginTop: 2,
    },

    // Floating Central Action Button
    addButtonWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      top: -16,
      marginHorizontal: 4,
    },

    plusContainer: {
      backgroundColor: colors.primary,
      width: 58,
      height: 58,
      borderRadius: 29,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3.5,
      borderColor: colors.surface,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.38,
      shadowRadius: 7,
      elevation: 10,
    },

    addLabel: {
      fontSize: 10,
      fontFamily: 'PlusJakartaSans-Bold',
      color: colors.primary,
      marginTop: 3,
      letterSpacing: 0.1,
    },

    // Badges
    unreadBadge: {
      position: 'absolute',
      top: -4,
      right: -8,
      backgroundColor: '#EF4444',
      minWidth: 17,
      height: 17,
      borderRadius: 8.5,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 1.5,
      borderColor: colors.surface,
    },

    unreadText: {
      color: '#FFFFFF',
      fontSize: 9.5,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 11,
    },

    newBadge: {
      position: 'absolute',
      top: -1,
      right: -3,
      backgroundColor: '#EF4444',
      width: 9,
      height: 9,
      borderRadius: 4.5,
      borderWidth: 1.5,
      borderColor: colors.surface,
    },
  });
