import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useEditGroup, GroupMemberItem } from '../../hooks/useEditGroup';
import AppToast from '../../components/AppToast';
import { Avatar } from '../../components/ui/Avatar';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MemberPicker, PickerUser } from '../../features/chat/components/MemberPicker';
import { Radius, Spacing, Typography } from '../../theme';
import { useT } from '../../i18n';

export default function EditGroupScreen() {
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  const {
    groupName,
    setGroupName,
    description,
    setDescription,
    image,
    members,
    isAdmin,
    followingContacts,
    loading,
    saving,
    toast,
    setToast,
    pickImage,
    handleSave,
    removeMember,
    leaveGroup,
    navigation,
  } = useEditGroup();

  const [showAddMembersSheet, setShowAddMembersSheet] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
  const [memberToRemove, setMemberToRemove] = useState<GroupMemberItem | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const contactsToPick: PickerUser[] = followingContacts.map((c: any) => ({
    id: c.id,
    name: c.fullname || c.username || 'Usuario',
    username: c.username || 'user',
    avatar: c.profile_pic_url || null,
  }));

  const handleToggleAddUser = (id: string) => {
    setSelectedToAdd((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmAddMembers = async () => {
    setShowAddMembersSheet(false);
    if (selectedToAdd.size > 0) {
      const allSelected = new Set([...members.map((m) => m.id), ...Array.from(selectedToAdd)]);
      await handleSave(allSelected);
      setSelectedToAdd(new Set());
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border + '20', backgroundColor: colors.surface },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
          ]}
        >
          {isAdmin ? t('chat.menu.editGroup') : t('groups.groupInfoTitle')}
        </Text>

        {isAdmin && (
          <TouchableOpacity
            style={[
              styles.saveBtn,
              {
                backgroundColor:
                  groupName.trim().length > 0 && !saving ? colors.primary : colors.componentBase,
              },
            ]}
            disabled={groupName.trim().length === 0 || saving}
            onPress={() => handleSave()}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.saveBtnText,
                  { color: groupName.trim().length > 0 ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t('common.save')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Avatar del grupo */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={[
                styles.avatarTouch,
                { backgroundColor: colors.componentBase, borderColor: colors.border + '30' },
              ]}
              disabled={!isAdmin}
              activeOpacity={0.8}
              onPress={pickImage}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Ionicons name="people" size={44} color={colors.primary} />
              )}
            </TouchableOpacity>
            {isAdmin && (
              <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
                {image ? t('groups.tapToChangePhoto') : t('groups.tapToAddPhoto')}
              </Text>
            )}
          </View>

          {/* Formulario / Info */}
          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.componentBase, borderColor: colors.border + '20' },
            ]}
          >
            <View style={styles.inputRow}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={22}
                color={colors.primary}
              />
              {isAdmin ? (
                <TextInput
                  style={[
                    styles.textInput,
                    { color: colors.textPrimary, fontFamily: Typography.fontFamilyBody },
                  ]}
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder={t('groups.groupNamePlaceholder')}
                  placeholderTextColor={colors.placeholder}
                  maxLength={50}
                />
              ) : (
                <Text
                  style={[
                    styles.staticText,
                    { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
                  ]}
                >
                  {groupName}
                </Text>
              )}
            </View>

            <View style={[styles.fieldDivider, { backgroundColor: colors.border + '15' }]} />

            <View style={styles.inputRow}>
              <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
              {isAdmin ? (
                <TextInput
                  style={[
                    styles.textInput,
                    { color: colors.textPrimary, fontFamily: Typography.fontFamilyBody },
                  ]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t('groups.descriptionPlaceholder')}
                  placeholderTextColor={colors.placeholder}
                  maxLength={120}
                />
              ) : (
                <Text style={[styles.staticDesc, { color: colors.textSecondary }]}>
                  {description || 'Sin descripción'}
                </Text>
              )}
            </View>
          </View>

          {/* Sección de Miembros */}
          <View style={styles.membersHeaderRow}>
            <Text
              style={[
                styles.membersSectionTitle,
                { color: colors.textSecondary, fontFamily: Typography.fontFamilyDisplay },
              ]}
            >
              {t('groups.membersSection', { count: members.length })}
            </Text>

            {isAdmin && (
              <TouchableOpacity
                style={[styles.addMemberBtn, { backgroundColor: colors.primary + '18' }]}
                onPress={() => setShowAddMembersSheet(true)}
              >
                <Ionicons name="person-add-outline" size={16} color={colors.primary} />
                <Text style={[styles.addMemberBtnText, { color: colors.primary }]}>
                  {t('groups.addMembers')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View
            style={[
              styles.membersListCard,
              { backgroundColor: colors.componentBase, borderColor: colors.border + '20' },
            ]}
          >
            {members.map((m) => {
              const isMemberAdmin = m.role === 'admin';
              return (
                <View
                  key={m.id}
                  style={[styles.memberRow, { borderBottomColor: colors.border + '15' }]}
                >
                  <Avatar uri={m.profile_pic_url} name={m.fullname || m.username} size={40} />

                  <View style={styles.memberInfo}>
                    <Text
                      style={[
                        styles.memberName,
                        { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
                      ]}
                      numberOfLines={1}
                    >
                      {m.fullname || m.username}
                    </Text>
                    <Text style={[styles.memberHandle, { color: colors.textSecondary }]}>
                      @{m.username}
                    </Text>
                  </View>

                  {isMemberAdmin && (
                    <View style={[styles.adminBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.adminBadgeText, { color: colors.primary }]}>
                        {t('groups.adminBadge')}
                      </Text>
                    </View>
                  )}

                  {isAdmin && !isMemberAdmin && (
                    <TouchableOpacity
                      style={styles.removeMemberBtn}
                      onPress={() => setMemberToRemove(m)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Botón Salir del grupo */}
          <TouchableOpacity
            style={[styles.leaveGroupRow, { borderColor: colors.danger + '30' }]}
            activeOpacity={0.75}
            onPress={() => setShowLeaveDialog(true)}
          >
            <Ionicons name="exit-outline" size={20} color={colors.danger} />
            <Text style={[styles.leaveGroupText, { color: colors.danger }]}>
              {t('chat.menu.leaveGroup')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Sheet para agregar miembros */}
      <BottomSheet
        visible={showAddMembersSheet}
        onClose={() => setShowAddMembersSheet(false)}
      >
        <View style={styles.addSheetContainer}>
          <View style={styles.addSheetHeader}>
            <Text
              style={[
                styles.addSheetTitle,
                { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
              ]}
            >
              {t('groups.addMembers')}
            </Text>
            <TouchableOpacity
              style={[
                styles.confirmAddBtn,
                { backgroundColor: selectedToAdd.size > 0 ? colors.primary : colors.componentBase },
              ]}
              disabled={selectedToAdd.size === 0}
              onPress={handleConfirmAddMembers}
            >
              <Text
                style={[
                  styles.confirmAddBtnText,
                  { color: selectedToAdd.size > 0 ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>

          <MemberPicker
            contacts={contactsToPick.filter((c) => !members.some((m) => m.id === c.id))}
            selectedIds={selectedToAdd}
            onToggleUser={handleToggleAddUser}
          />
        </View>
      </BottomSheet>

      {/* Diálogo confirmación remover miembro */}
      <ConfirmDialog
        visible={memberToRemove !== null}
        title={t('groups.removeMember')}
        message={t('groups.removeMemberConfirm', {
          name: memberToRemove?.fullname || memberToRemove?.username || '',
        })}
        isDestructive={true}
        onConfirm={() => {
          if (memberToRemove) {
            removeMember(memberToRemove.id);
            setMemberToRemove(null);
          }
        }}
        onCancel={() => setMemberToRemove(null)}
      />

      {/* Diálogo salir del grupo */}
      <ConfirmDialog
        visible={showLeaveDialog}
        title={t('messages.leaveGroupTitle')}
        message={t('messages.leaveGroupDesc')}
        isDestructive={true}
        onConfirm={() => {
          setShowLeaveDialog(false);
          leaveGroup();
        }}
        onCancel={() => setShowLeaveDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  avatarTouch: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarHint: {
    fontSize: 13,
    fontWeight: '500',
  },
  formCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  staticText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  staticDesc: {
    flex: 1,
    fontSize: 14,
  },
  fieldDivider: {
    height: 1,
    marginLeft: 48,
  },
  membersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  membersSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 4,
  },
  addMemberBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  membersListCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  memberHandle: {
    fontSize: 12.5,
    marginTop: 1,
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  removeMemberBtn: {
    padding: 6,
  },
  leaveGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
    marginBottom: 32,
  },
  leaveGroupText: {
    fontSize: 15,
    fontWeight: '700',
  },
  addSheetContainer: {
    paddingVertical: 8,
    maxHeight: 520,
  },
  addSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: 8,
  },
  addSheetTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  confirmAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  confirmAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
