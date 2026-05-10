import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    marginTop: 4,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1.2,
    borderWidth: 2,
    borderColor: '#C8D1CE',
    borderStyle: 'dashed',
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
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
    backgroundColor: '#F0F7F4',
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
    color: Colors.primary,
  },
  photoSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF0EF',
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
    color: Colors.textPrimary,
  },
  notesContainer: {
    backgroundColor: '#ECF0EF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 120,
  },
  notesInput: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
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
    color: Colors.primary,
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
    backgroundColor: Colors.surface,
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
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF9',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E8EDEB',
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
    color: Colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  postButton: {
    backgroundColor: '#2D5A27',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    ...Shadows.button,
  },
  postIcon: {
    marginRight: 8,
    transform: [{ rotate: '45deg' }], // Slight angle for the paper plane
    marginTop: -4,
  },
  postButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});

