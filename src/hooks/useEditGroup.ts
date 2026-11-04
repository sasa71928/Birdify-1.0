import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { compressImage, prepareImageForUpload } from '../utils/imageCompressor';
import { supabase } from '../lib/supabase';
import { ConversationRepository } from '../repositories/conversation.repository';
import { FollowRepository } from '../repositories/follow.repository';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { handleError } from '../utils/errorHandler';

type EditGroupNavProp = NativeStackNavigationProp<RootStackParamList, 'EditGroup'>;
type EditGroupRouteProp = RouteProp<RootStackParamList, 'EditGroup'>;

export interface GroupMemberItem {
  id: string;
  username: string;
  fullname: string | null;
  profile_pic_url: string | null;
  role: 'admin' | 'member';
}

export function useEditGroup() {
  const navigation = useNavigation<EditGroupNavProp>();
  const route = useRoute<EditGroupRouteProp>();
  const { conversationId } = route.params;
  const { user } = useAuth();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMemberItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [followingContacts, setFollowingContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const loadGroupData = useCallback(async () => {
    try {
      setLoading(true);
      const [conv, following] = await Promise.all([
        ConversationRepository.getById(conversationId),
        user?.id ? FollowRepository.getFollowing(user.id) : Promise.resolve([]),
      ]);

      if (conv) {
        setGroupName(conv.name || '');
        setDescription(conv.description || '');
        setImage(conv.avatar_url || null);

        const convMembers: GroupMemberItem[] = (conv.members || []).map((m: any) => {
          const u = Array.isArray(m.users) ? m.users[0] : m.users;
          return {
            id: m.user_id,
            username: u?.username || 'usuario',
            fullname: u?.fullname || null,
            profile_pic_url: u?.profile_pic_url || null,
            role: m.role || 'member',
          };
        });

        setMembers(convMembers);
        const myMember = convMembers.find((m) => m.id === user?.id);
        setIsAdmin(myMember?.role === 'admin');
      }

      setFollowingContacts(following || []);
    } catch (e) {
      handleError(e, setToast, 'Error al cargar información del grupo');
    } finally {
      setLoading(false);
    }
  }, [conversationId, user?.id]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  const pickImage = async () => {
    if (!isAdmin) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setToast({ visible: true, message: 'Permiso denegado para fotos', type: 'error' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const compressed = await compressImage(result.assets[0].uri, 'avatar');
      setImage(compressed.uri);
    }
  };

  const handleSave = async (selectedMemberIds?: Set<string>) => {
    if (!isAdmin || !user || saving) return;
    try {
      setSaving(true);

      let finalAvatarUrl = image;
      if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
        const prepared = await prepareImageForUpload(image, 'avatar');
        const fileName = `${user.id}/${Date.now()}.${prepared.fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('group-avatars')
          .upload(fileName, prepared.arrayBuffer, {
            contentType: prepared.mimeType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('group-avatars')
            .getPublicUrl(fileName);
          finalAvatarUrl = publicUrl;
        }
      }

      // Si se pasaron miembros seleccionados, calcular altas y bajas
      if (selectedMemberIds) {
        const currentIds = new Set(members.map((m) => m.id));
        const toAdd = Array.from(selectedMemberIds).filter((id) => !currentIds.has(id));
        const toRemove = Array.from(currentIds).filter(
          (id) => !selectedMemberIds.has(id) && id !== user.id
        );

        const { error: rpcError } = await supabase.rpc('update_group', {
          p_conversation_id: conversationId,
          p_name: groupName.trim(),
          p_description: description.trim() || null,
          p_avatar_url: finalAvatarUrl,
          p_add_member_ids: toAdd,
          p_remove_member_ids: toRemove,
        });

        if (rpcError) {
          // Fallback tradicional
          await ConversationRepository.updateConversation(conversationId, {
            name: groupName.trim(),
            description: description.trim() || undefined,
            avatar_url: finalAvatarUrl,
          });
          if (toAdd.length > 0) {
            await ConversationRepository.addConversationMembers(conversationId, toAdd);
          }
          if (toRemove.length > 0) {
            await ConversationRepository.removeConversationMembers(conversationId, toRemove);
          }
        }
      } else {
        await ConversationRepository.updateConversation(conversationId, {
          name: groupName.trim(),
          description: description.trim() || undefined,
          avatar_url: finalAvatarUrl,
        });
      }

      setToast({ visible: true, message: 'Grupo actualizado correctamente', type: 'success' });
      await loadGroupData();
    } catch (e) {
      handleError(e, setToast, 'No se pudo actualizar el grupo');
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!isAdmin || memberId === user?.id) return;
    try {
      await ConversationRepository.removeConversationMembers(conversationId, [memberId]);
      setToast({ visible: true, message: 'Miembro eliminado', type: 'success' });
      await loadGroupData();
    } catch (e) {
      handleError(e, setToast, 'No se pudo eliminar al miembro');
    }
  };

  const leaveGroup = async () => {
    if (!user) return;
    try {
      await ConversationRepository.leaveConversation(conversationId, user.id);
      setToast({ visible: true, message: 'Has salido del grupo', type: 'success' });
      setTimeout(() => navigation.navigate('MainTabs', { screen: 'Messages' }), 500);
    } catch (e) {
      handleError(e, setToast, 'No se pudo salir del grupo');
    }
  };

  return {
    conversationId,
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
  };
}
