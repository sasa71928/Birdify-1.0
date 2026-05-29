import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { ConversationRepository } from '../repositories/conversation.repository';
import { ProfileRepository } from '../repositories/profile.repository';
import { FollowRepository } from '../repositories/follow.repository';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';

type EditGroupNavProp = NativeStackNavigationProp<RootStackParamList, 'EditGroup'>;
type EditGroupRouteProp = RouteProp<RootStackParamList, 'EditGroup'>;

export function useEditGroup() {
  const navigation = useNavigation<EditGroupNavProp>();
  const route = useRoute<EditGroupRouteProp>();
  const { conversationId } = route.params;
  const { user } = useAuth();
  
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadGroupData();
    loadUsers();
  }, [conversationId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const conversation = await ConversationRepository.getById(conversationId);
      if (conversation) {
        setGroupName(conversation.name || '');
        setDescription(conversation.description || '');
        setImage(conversation.avatar_url || null);
        
        const members = conversation.members || [];
        const memberIds = members.map((m: any) => m.user_id);
        setSelected(new Set(memberIds));
      }
    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await ProfileRepository.getAll();
      const following = await FollowRepository.getFollowing(user?.id || '');
      const followingIds = new Set(following.map((f: any) => f.following_id));
      
      const filteredUsers = allUsers.filter((u: any) => 
        u.id !== user?.id && followingIds.has(u.id)
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
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
      if (image && image.startsWith('file://')) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser?.id) {
          console.error('User not authenticated');
          throw new Error('User not authenticated');
        }
        const fileName = `${authUser.id}/${Date.now()}.jpg`;
        
        const formData = new FormData();
        formData.append('file', {
          uri: image,
          type: 'image/jpeg',
          name: fileName,
        } as any);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('group-avatars')
          .upload(fileName, formData, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error('Error uploading group avatar:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('group-avatars')
            .getPublicUrl(fileName);
          finalAvatarUrl = publicUrl;
          console.log('Group avatar uploaded successfully:', publicUrl);
        }
      }

      console.log('Updating conversation with avatar_url:', finalAvatarUrl);
      await ConversationRepository.updateConversation(conversationId, {
        name: groupName.trim(),
        description: description.trim() || undefined,
        avatar_url: finalAvatarUrl,
      });

      const currentMembers = await ConversationRepository.getConversationMembers(conversationId);
      const currentMemberIds = new Set(currentMembers.map((m: any) => m.user_id));
      
      const newMembers = Array.from(selected).filter(id => !currentMemberIds.has(id));
      if (newMembers.length > 0) {
        await ConversationRepository.addConversationMembers(conversationId, newMembers);
      }

      const removedMembers = Array.from(currentMemberIds).filter(id => !selected.has(id) && id !== user.id);
      if (removedMembers.length > 0) {
        await ConversationRepository.removeConversationMembers(conversationId, removedMembers);
      }

      showToast('Grupo actualizado.', 'success');
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (e) {
      console.error('Error updating group:', e);
      showToast('No se pudo actualizar el grupo.', 'error');
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
    // State
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
    
    // Setters
    setGroupName,
    setDescription,
    setImage,
    setSearchQuery,
    setToast,
    
    // Actions
    pickImage,
    handleSave,
    showToast,
    toggleUser,
  };
}
