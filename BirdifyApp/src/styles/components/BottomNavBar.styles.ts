import { StyleSheet } from 'react-native';
import { Radius, Spacing } from '../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingBottom: 20, // To account for bottom safe area
    paddingTop: 10,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: colors.border + '20',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  activeItem: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
  },
  navText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  addButton: {
    top: -10,
  },
  plusContainer: {
    backgroundColor: colors.primary, // Using primary color for the add button
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#FF5252',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
});
