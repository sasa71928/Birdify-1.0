import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../theme';

const { width } = Dimensions.get('window');
const GRID_SPACING = 6;
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - Spacing.md * 2 - GRID_SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

export const createStyles = (colors: any) => StyleSheet.create({
  scroll: { flex: 1 },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.springMoss + '30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
    gap: 4,
  },
  verificationText: {
    fontSize: Typography.fontSize.xs,
    color: colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  scrollContent: { paddingBottom: 120 },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: colors.surface,
  },
  avatarWrapper: { position: 'relative', marginBottom: Spacing.md },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: colors.canvasPure,
    borderRadius: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  editIconBtn: {
    padding: 4,
  },
  usernameText: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  professionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.springMoss + '30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
    gap: 4,
  },
  professionText: {
    fontSize: Typography.fontSize.xs,
    color: colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: Spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.componentBase },
  bio: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.sm,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.componentBase,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: colors.textSecondary,
  },
  activeTabText: { color: colors.primary },

  // Sightings grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: GRID_SPACING,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: { width: '100%', height: '100%' },
  locationBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logbook
  logbookContainer: { padding: Spacing.md },
  logbookSummary: {
    flexDirection: 'row',
    backgroundColor: colors.canvasPure,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  logbookStat: { flex: 1, alignItems: 'center', gap: 4 },
  logbookStatValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  logbookStatLabel: { fontSize: 10, color: colors.textSecondary },
  logbookStatDivider: { width: 1, backgroundColor: colors.componentBase, marginVertical: 4 },
  logbookSectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Stamps grid (2 columns)
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  stampCard: {
    width: (width - Spacing.md * 2 - Spacing.md) / 2 - 0.5,
    backgroundColor: colors.canvasPure,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    ...Shadows.card,
  },
  stampImageWrap: {
    width: '100%',
    height: 120,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.componentBase,
  },
  stampImageRare: {
    borderColor: colors.tertiaryBrown + '80',
    borderWidth: 2,
  },
  stampImage: { width: '100%', height: '100%' },
  rareBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.tertiaryBrown,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfTop: {
    position: 'absolute',
    top: -5,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  perfBottom: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  perfDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surface,
  },
  stampName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  stampScientific: {
    fontSize: 9,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  stampCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
    backgroundColor: colors.componentBase,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stampCount: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },

  // Likes (grid)
  likeHeartBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: Radius.full,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  likeGridCount: {
    fontSize: 9,
    color: colors.canvasPure,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    height: '70%',
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  followItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  followAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.componentBase,
  },
  followName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  followUsername: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
  },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  followingBtn: {
    backgroundColor: colors.componentBase,
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.canvasPure,
  },
  followingBtnText: {
    color: colors.textPrimary,
  },
  
  // Private Account View
  privateContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  privateIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.componentBase,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  privateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  privateSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Action Buttons (Other profiles)
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginVertical: 15,
  },
  followMainBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followMainBtnText: {
    color: colors.canvasPure,
    fontWeight: 'bold',
    fontSize: 14,
  },
  messageMainBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logbookModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logbookModalContent: {
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    width: '100%',
    maxWidth: 400,
    height: 500,
    overflow: 'hidden',
    ...Shadows.modal,
  },
  logbookModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logbookModalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  logbookModalImagesContainer: {
    height: 400,
  },
  logbookModalImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  logbookModalImage: {
    width: 90,
    height: 90,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: Radius.md,
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});

