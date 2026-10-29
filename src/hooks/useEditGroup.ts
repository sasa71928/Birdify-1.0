import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { ConversationRepository } from '../repositories/conversation.repository';
import { FollowRepository } from '../repositories/follow.repository';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';
import { handleError } from '../utils/errorHandler';

type EditGroupNavProp = NativeStackNavigationProp<RootStackParamList, 'EditGroup'>;
type EditGroupRouteProp = RouteProp<RootStackParamList, 'EditGroup'>;

interface EditableGroupUser {
  id: string;
  username: string;
  fullname: string | null;
  profile_pic_url: string | null;
}

export function useEditGroup() {
  const navigation = useNavigation<EditGroupNavProp>();
  const route = useRoute<EditGroupRouteProp>();
  const { conversationId } = route.params;
  const { user } = useAuth();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<EditableGroupUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadGroupAndUsers();
  }, [conversationId, user?.id]);

  const loadGroupAndUsers = async () => {
    try {
      setLoading(true);
      const [conversation, following] = await Promise.all([
        ConversationRepository.getById(conversationId),
        user?.id ? FollowRepository.getFollowing(user.id) : Promise.resolve([]),
      ]);

      const mergedById = new Map<string, EditableGroupUser>();

      // FollowRepository.getFollowing ya retorna objetos { id, username, fullname, profile_pic_url } (AUD-015)
      for (const followedUser of following as EditableGroupUser[]) {
        if (followedUser?.id && followedUser.id !== user?.id) {
          mergedById.set(followedUser.id, followedUser);
        }
      }

      if (conversation) {
        setGroupName(conversation.name || '');
        setDescription(conversation.description || '');
        setImage(conversation.avatar_url || null);

        const members = conversation.members || [];
        const memberIds = members.map((m) => m.user_id);
        setSelected(new Set(memberIds));

        // Conservar también en la lista los miembros actuales aunque el admin no los siga
        for (const member of members) {
          const memberProfile = member.users;
          if (memberProfile?.id && memberProfile.id !== user?.id && !mergedById.has(memberProfile.id)) {
            mergedById.set(memberProfile.id, {
              id: memberProfile.id,
              username: memberProfile.username,
              fullname: memberProfile.fullname,
              profile_pic_url: memberProfile.profile_pic_url,
            });
          }
        }
      }

      setUsers(Array.from(mergedById.values()));
    } catch (error) {
      handleError(error, setToast, 'Error loading group data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      handleError('Permiso denegado', setToast, 'Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!canSave || !user || saving) return;
    try {
      setSaving(true);

      let finalAvatarUrl = image;
      if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser?.id) {
          handleError('User not authenticated', setToast, 'User not authenticated');
          throw new Error('User not authenticated');
        }
        const rawExt = (image.split('.').pop() || 'jpg').toLowerCase().split('?')[0];
        const ext = rawExt === 'png' || rawExt === 'webp' ? rawExt : 'jpg';
        const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        const fileName = `${authUser.id}/${Date.now()}.${ext}`;

        const response = await fetch(image);
        const arrayBuffer = await response.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from('group-avatars')
          .upload(fileName, arrayBuffer, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          handleError(uploadError, setToast, 'Error uploading group avatar');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('group-avatars')
            .getPublicUrl(fileName);
          finalAvatarUrl = publicUrl;
        }
      }

      await ConversationRepository.updateConversation(conversationId, {
        name: groupName.trim(),
        description: description.trim() || undefined,
        avatar_url: finalAvatarUrl,
      });

      const currentMembers = await ConversationRepository.getConversationMembers(conversationId);
      const currentMemberIds = new Set(currentMembers.map((m) => m.user_id));

      const newMembers = Array.from(selected).filter((id) => !currentMemberIds.has(id));
      if (newMembers.length > 0) {
        await ConversationRepository.addConversationMembers(conversationId, newMembers);
      }

      const removedMembers = Array.from(currentMemberIds).filter((id) => !selected.has(id) && id !== user.id);
      if (removedMembers.length > 0) {
        await ConversationRepository.removeConversationMembers(conversationId, removedMembers);
      }

      showToast('Grupo actualizado.', 'success');
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (e) {
      handleError(e, setToast, 'No se pudo actualizar el grupo.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = groupName.trim().length > 0 && selected.size >= 1;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };

  const toggleUser = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.fullname?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query)
    );
  });

  return {
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
    setImage,
    setSearchQuery,
    setToast,
    pickImage,
    handleSave,
    showToast,
    toggleUser,
  };
}
