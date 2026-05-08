import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../theme';

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Hero
  hero: {
    height: 260,
    position: 'relative',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.lg,
    
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },

  heroContent: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    paddingHorizontal: 20,
  },
  heroName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.canvasPure,
    lineHeight: 38,
  },
  heroScientific: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
    color: Colors.springMoss,
    marginTop: 2,
  },

  // Card (classification)
  card: {
    backgroundColor: Colors.canvasPure,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  classCell: {
    width: '33.33%',
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.componentBase,
  },
  classCellLabel: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.outlineGrey,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  classCellValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    fontStyle: 'italic',
  },

  // Section
  section: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  overviewText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },

  // Info blocks (Habitat / Conservation)
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.componentBase,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoBlockText: {
    flex: 1,
  },
  infoBlockTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  infoBlockBody: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Sightings
  sightingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAll: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },
  sightingCard: {
    backgroundColor: Colors.canvasPure,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  sightingAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sightingAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.componentBase,
  },
  sightingUser: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  sightingMeta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  sightingImage: {
    width: '100%',
    height: 200,
  },
  sightingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sightingActionGroup: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sightingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sightingActionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
});

