import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../theme';

export default StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingBottom: 20, // To account for bottom safe area
    paddingTop: 10,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
  },
  navText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  addButton: {
    top: -10,
  },
  plusContainer: {
    backgroundColor: '#2D5A27', // Darker green as in image
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
});
