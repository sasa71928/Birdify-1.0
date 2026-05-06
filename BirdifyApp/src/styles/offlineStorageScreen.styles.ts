import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  placeholder: { width: 32 },
  
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  
  // Storage Overview
  card: {
    backgroundColor: Colors.canvasPure,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  storageTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E7E4',
    borderRadius: Radius.full,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBar: {
    backgroundColor: Colors.primary,
    height: '100%',
  },
  progressBarApp: {
    backgroundColor: Colors.tertiaryBrown,
    height: '100%',
  },
  storageLegends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  storageDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Preferences
  preferencesCard: {
    backgroundColor: Colors.canvasPure,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },
  prefDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Packages
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packageList: {
    backgroundColor: Colors.canvasPure,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    marginBottom: Spacing.xxl,
  },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  packageInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  packageName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  packageSize: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  downloadBtn: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginLeft: Spacing.md,
  },
  downloadProgressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  downloadTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E7E4',
    borderRadius: 2,
    overflow: 'hidden',
  },
  downloadFill: {
    height: '100%',
    backgroundColor: Colors.secondaryBlue,
  },
  downloadPercent: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondaryBlue,
  },
});

