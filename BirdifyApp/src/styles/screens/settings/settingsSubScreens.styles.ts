import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: colors.primary,
    marginLeft: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  // ── Language Screen ────────────────────────────────────────────────────────
  mainTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: colors.primary,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.tight,
  },
  languageList: {
    marginBottom: Spacing.xl,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border + '20',
    marginBottom: Spacing.sm,
    backgroundColor: colors.canvasPure,
  },
  languageItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  langIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.componentBase,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  langIconText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  langName: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },

  // ── Privacy & Security ─────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.primary,
    marginLeft: Spacing.sm,
  },
  settingsCard: {
    backgroundColor: colors.canvasPure,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border + '20',
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  aboutCard: {
    backgroundColor: colors.canvasPure,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border + '20',
    overflow: 'hidden',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  settingContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  settingLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  settingSublabel: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.border + '20',
    marginHorizontal: Spacing.md,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorRed + '20',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
  },
  deleteBtnText: {
    color: colors.errorRed,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
  deleteWarning: {
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  notifSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  notifSectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.secondaryBlue, 
    marginLeft: Spacing.sm,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border + '20',
    marginBottom: Spacing.sm,
    backgroundColor: colors.canvasPure,
  },
  notifCardActive: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary + '20',
  },
  notifIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: colors.componentBase,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  notifIconBoxActive: {
    backgroundColor: colors.primary + '20',
  },
  notifTextContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  notifDesc: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ── Edit Profile ───────────────────────────────────────────────────────────
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.componentBase,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border + '20',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  formSection: {
    marginTop: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: colors.componentBase,
    borderWidth: 1,
    borderColor: colors.border + '20',
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    ...Shadows.button,
  },
  saveBtnText: {
    color: colors.canvasPure,
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.md,
  },

  // ── Help & Support / FAQ ───────────────────────────────────────────────────
  faqItem: {
    backgroundColor: colors.canvasPure,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.border + '20',
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  faqQuestion: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqAnswer: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.componentBase,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.lg,
  },
  contactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contactTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  contactSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // ── About Birdify ──────────────────────────────────────────────────────────
  aboutHeader: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: Radius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: colors.primary,
  },
  appVersion: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  aboutDescription: {
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  linkText: {
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
  },
});
