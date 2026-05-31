import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from '../../styles/screens/social/createGroupScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useEditGroup } from '../../hooks/useEditGroup';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AppToast from '../../components/AppToast';

type EditGroupRouteProp = RouteProp<RootStackParamList, 'EditGroup'>;

interface MemberProfile {
  id: string;
  username: string;
  fullname: string | null;
  profile_pic_url: string | null;
}

export default function EditGroupScreen() {
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const route = useRoute<EditGroupRouteProp>();
  const { conversationId } = route.params;

  const {
    groupName,
    description,
    image,
    selected,
    users,
    searchQuery,
    loading,
    saving,
    toast,
    filteredUsers,
    canSave,
    navigation,
    setGroupName,
    setDescription,
    setSearchQuery,
    setToast,
    pickImage,
    handleSave,
    toggleUser,
  } = useEditGroup();

  // ── Miembros actuales enriquecidos con perfil ─────────────────────────────
  const [memberProfiles, setMemberProfiles] = useState<MemberProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const members = await ConversationRepository.getConversationMembers(conversationId);
        const profiles: MemberProfile[] = members.map((m: any) => {
          const u = Array.isArray(m.users) ? m.users[0] : m.users;
          return {
            id: m.user_id,
            username: u?.username || 'usuario',
            fullname: u?.fullname || null,
            profile_pic_url: u?.profile_pic_url || null,
          };
        });
        setMemberProfiles(profiles);
      } catch {
        // silencioso; el hook ya maneja errores generales
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [conversationId]);

  // Sincronizar cuando `selected` cambia (alguien fue agregado/quitado)
  // Los perfiles que ya tenemos se mantienen; los nuevos se añaden desde `users`
  const currentMemberProfiles: MemberProfile[] = Array.from(selected).map((id) => {
    // Buscar primero en los perfiles cargados del grupo
    const fromGroup = memberProfiles.find((p) => p.id === id);
    if (fromGroup) return fromGroup;
    // Luego en la lista de usuarios disponibles (seguidos)
    const fromUsers = users.find((u: any) => u.id === id);
    if (fromUsers) {
      return {
        id: fromUsers.id,
        username: fromUsers.username || 'usuario',
        fullname: fromUsers.fullname || null,
        profile_pic_url: fromUsers.profile_pic_url || null,
      };
    }
    return { id, username: 'usuario', fullname: null, profile_pic_url: null };
  });

  // ── Render de usuario disponible para agregar ─────────────────────────────
  const renderAvailableUser = ({ item }: { item: any }) => {
    const isSelected = selected.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected ? styles.userItemSelected : null]}
        onPress={() => toggleUser(item.id)}
        activeOpacity={0.75}
      >
        <Image
          source={{ uri: item.profile_pic_url || 'https://gravatar.com/avatar/?d=mp' }}
          style={styles.userAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.fullname || item.username}</Text>
          {item.fullname ? (
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
              @{item.username}
            </Text>
          ) : null}
        </View>
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            borderWidth: 2,
            borderColor: isSelected ? colors.primary : colors.border,
            backgroundColor: isSelected ? colors.primary : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isSelected && <Ionicons name="checkmark" size={14} color={colors.canvasPure} />}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Grupo</Text>
        <TouchableOpacity
          style={[styles.saveBtn, canSave ? styles.saveBtnActive : styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.canvasPure} />
          ) : (
            <Text style={styles.saveBtnText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Group Avatar ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.groupAvatar} />
            ) : (
              <View style={[styles.groupAvatar, styles.groupAvatarPlaceholder]}>
                <Ionicons name="camera" size={32} color={colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeAvatarBtn} onPress={pickImage}>
            <Text style={styles.changeAvatarText}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>

        {/* ── Group Name ── */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Nombre del grupo</Text>
          <TextInput
            style={styles.input}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Nombre del grupo"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* ── Description ── */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción del grupo"
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* ── Miembros actuales ── */}
        <View style={[styles.membersSection, { paddingBottom: 0 }]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Ionicons name="people" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>
              Miembros actuales{' '}
              <Text style={{ color: colors.primary }}>({selected.size})</Text>
            </Text>
          </View>

          {loadingMembers ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : currentMemberProfiles.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 12 }}>
              Sin miembros.
            </Text>
          ) : (
            currentMemberProfiles.map((member) => (
              <View
                key={member.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border + '20',
                }}
              >
                <Image
                  source={{
                    uri: member.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 12,
                    backgroundColor: colors.componentBase,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: colors.textPrimary,
                    }}
                  >
                    {member.fullname || member.username}
                  </Text>
                  {member.fullname ? (
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                      @{member.username}
                    </Text>
                  ) : null}
                </View>
                {/* Botón quitar (solo si hay más de 1 miembro) */}
                {selected.size > 1 && (
                  <TouchableOpacity
                    onPress={() => toggleUser(member.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: colors.border + '30',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="remove" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* ── Agregar personas ── */}
        <View style={[styles.membersSection, { marginTop: 20 }]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Ionicons
              name="person-add-outline"
              size={18}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.sectionTitle}>Agregar personas</Text>
          </View>

          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar usuarios que sigues..."
            placeholderTextColor={colors.placeholder}
          />

          {users.length === 0 ? (
            <Text
              style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}
            >
              No sigues a nadie más para agregar.
            </Text>
          ) : filteredUsers.length === 0 ? (
            <Text
              style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}
            >
              Sin resultados para "{searchQuery}".
            </Text>
          ) : (
            filteredUsers.map((item: any) => {
              const isSelected = selected.has(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.userItem, isSelected ? styles.userItemSelected : null]}
                  onPress={() => toggleUser(item.id)}
                  activeOpacity={0.75}
                >
                  <Image
                    source={{
                      uri: item.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
                    }}
                    style={styles.userAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{item.fullname || item.username}</Text>
                    {item.fullname ? (
                      <Text
                        style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}
                      >
                        @{item.username}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color={colors.canvasPure} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}