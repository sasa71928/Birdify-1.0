import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/social/createGroupScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { ProfileRepository } from '../../repositories/profile.repository';
import AppToast from '../../components/AppToast';

type EditGroupNavProp = NativeStackNavigationProp<RootStackParamList, 'EditGroup'>;
type EditGroupRouteProp = RouteProp<RootStackParamList, 'EditGroup'>;

export default function EditGroupScreen() {
  const navigation = useNavigation<EditGroupNavProp>();
  const route = useRoute<EditGroupRouteProp>();
  const { conversationId } = route.params;
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();
  
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<any[]>([]);
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
        
        // Load current members
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
      // Filter out current user
      const filteredUsers = allUsers.filter((u: any) => u.id !== user?.id);
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
      await ConversationRepository.updateConversation(conversationId, {
        name: groupName.trim(),
        description: description.trim() || undefined,
        avatar_url: image,
      });

      // Update members if changed
      const currentMembers = await ConversationRepository.getConversationMembers(conversationId);
      const currentMemberIds = new Set(currentMembers.map((m: any) => m.user_id));
      
      // Add new members
      const newMembers = Array.from(selected).filter(id => !currentMemberIds.has(id));
      if (newMembers.length > 0) {
        await ConversationRepository.addConversationMembers(conversationId, newMembers);
      }

      // Remove old members (except creator)
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

  const renderUser = ({ item }: { item: any }) => {
    const isSelected = selected.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected ? styles.userItemSelected : null]}
        onPress={() => toggleUser(item.id)}
      >
        <Image
          source={{ uri: item.profile_pic_url || 'https://gravatar.com/avatar/?d=mp' }}
          style={styles.userAvatar}
        />
        <Text style={styles.userName}>{item.fullname || item.username}</Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
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
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
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

      {/* ── Members ── */}
      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>Miembros ({selected.size})</Text>
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
