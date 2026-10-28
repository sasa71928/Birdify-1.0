import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    marginLeft: Spacing.md,
  },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  createBtnDisabled: {
    backgroundColor: colors.componentBase,
  },
  createBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: colors.canvasPure,
  },
  createBtnTextDisabled: {
    color: colors.placeholder,
  },

  // Group icon
  iconSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  groupIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.componentBase,
    borderWidth: 2,
    borderColor: colors.border + '50',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    overflow: 'hidden', 
  },
  groupIconImage: {
    width: '100%',
    height: '100%',
  },
  iconHint: {
    fontSize: Typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // Form
  formCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: colors.canvasPure,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    ...Shadows.card,
    marginBottom: Spacing.lg,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  fieldInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border + '20',
    marginLeft: 28,
  },

  // Selected chips
  selectedSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chipRow: {
    gap: Spacing.sm,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary + '50',
  },
  chipAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  chipName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: colors.primary,
  },

  // Contacts
  contactsSection: {
    marginHorizontal: Spacing.md,
    marginBottom: 40,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  contactAvatarWrap: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.componentBase,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34A853',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  contactName: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
  },
  userName: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
  },
  saveBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  saveBtnActive: {
    backgroundColor: colors.primary,
  },
  saveBtnDisabled: {
    backgroundColor: colors.outlineGrey,
  },
  saveBtnText: {
    color: colors.canvasPure,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  groupAvatarPlaceholder: {
    backgroundColor: colors.componentBase,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarBtn: {
    marginTop: Spacing.sm,
  },
  changeAvatarText: {
    color: colors.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  inputSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: colors.componentBase,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  membersSection: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: Spacing.md,
  },
  searchInput: {
    backgroundColor: colors.componentBase,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: colors.textPrimary,
    marginBottom: Spacing.md,
  },
  usersList: {
    paddingBottom: 20,
  },
  leaveGroupSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border + '20',
  },
  leaveGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.componentBase,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  leaveGroupText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#FF5252',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...Shadows.modal,
  },
  modalIcon: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalMessage: {
    fontSize: Typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.componentBase,
  },
  modalButtonLeave: {
    backgroundColor: '#FF5252',
  },
  modalButtonTextCancel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  modalButtonTextLeave: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: colors.white,
  },
});

