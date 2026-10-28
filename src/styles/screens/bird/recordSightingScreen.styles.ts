import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: Spacing.lg,
    marginTop: 4,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1.2,
    borderWidth: 2,
    borderColor: colors.border + '50',
    borderStyle: 'dashed',
    borderRadius: Radius.xl,
    backgroundColor: colors.canvasPure,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  photoInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  plusIconBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
  },
  photoTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.primary,
  },
  photoSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.componentBase,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
  },
  notesContainer: {
    backgroundColor: colors.componentBase,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 120,
  },
  notesInput: {
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  useCurrentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  useCurrentText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: colors.primary,
    marginLeft: 4,
  },
  mapContainer: {
    width: '100%',
    height: 180,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapPin: {
    position: 'absolute',
    top: '40%',
    left: '48%',
  },
  adjustPinBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    ...Shadows.card,
  },
  adjustPinText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.canvasPure,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border + '20',
    marginBottom: Spacing.xl,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: Spacing.sm,
  },
  toggleTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  postButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    ...Shadows.button,
  },
  postIcon: {
    marginRight: 8,
    transform: [{ rotate: '45deg' }], 
    marginTop: -4,
  },
  postButtonText: {
    color: colors.canvasPure,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});

