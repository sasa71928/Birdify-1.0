import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Typography, Spacing, Radius, Shadows } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/social/createGroupScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { FollowRepository } from '../../repositories/follow.repository';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CreateGroup'>;

export default function CreateGroupScreen() {
  const navigation = useNavigation<NavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contacts, setContacts] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3600);
  };

  React.useEffect(() => {
    let mounted = true;
    const loadContacts = async () => {
      if (!user) return;
      try {
        setLoadingContacts(true);
        const following = await FollowRepository.getFollowing(user.id);
        const mapped = (following || []).map((u: any) => ({
          id: u.id,
          name: u.fullname || u.username || 'Usuario',
          avatar: u.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
        }));
        if (mounted) setContacts(mapped);
      } catch (e) {
        handleError(e, setToast, 'No se pudo cargar tu lista de contactos');
      } finally {
        if (mounted) setLoadingContacts(false);
      }
    };
    loadContacts();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return contact.name.toLowerCase().includes(query);
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      handleError('Permiso denegado', setToast, 'Se necesita permiso para acceder a la galería.');
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

  const handleCreate = async () => {
    if (!canCreate || !user || creating) return;
    try {
      setCreating(true);
      const conversationId = await ConversationRepository.createGroupConversation({
        creatorId: user.id,
        name: groupName.trim(),
        description: description.trim() || undefined,
        avatarUrl: image,
        memberIds: Array.from(selected),
      });

      showToast('Grupo creado.', 'success');
      setTimeout(() => {
        navigation.navigate('MainTabs', { screen: 'Messages' });
      }, 500);
    } catch (e) {
      handleError(e, setToast, 'No se pudo crear el grupo');
    } finally {
      setCreating(false);
    }
  };

  const canCreate = groupName.trim().length > 0 && selected.size >= 1;

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
        <Text style={styles.headerTitle}>New Group</Text>
        <TouchableOpacity
          style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
          disabled={!canCreate || creating}
          onPress={handleCreate}
        >
          <Text style={[styles.createBtnText, !canCreate && styles.createBtnTextDisabled]}>
            {creating ? 'Creating…' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Group icon placeholder ── */}
        <View style={styles.iconSection}>
          <TouchableOpacity style={styles.groupIconCircle} activeOpacity={0.75} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.groupIconImage} />
            ) : (
              <MaterialCommunityIcons name="camera-plus-outline" size={28} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          <Text style={styles.iconHint}>{image ? 'Tap to change photo' : 'Tap to add a group photo'}</Text>
        </View>

        {/* ── Campos del grupo ── */}
        <View style={styles.formCard}>
          <View style={styles.fieldRow}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color={colors.primary} />
            <TextInput
              style={styles.fieldInput}
              placeholder="Group name"
              placeholderTextColor={colors.placeholder}
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.fieldRow}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <TextInput
              style={styles.fieldInput}
              placeholder="Description (optional)"
              placeholderTextColor={colors.placeholder}
              value={description}
              onChangeText={setDescription}
              maxLength={120}
            />
          </View>
        </View>

        {/* ── Miembros seleccionados (chips) ── */}
        {selected.size > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionLabel}>Selected ({selected.size})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {contacts.filter((c) => selected.has(c.id)).map((c) => (
                <TouchableOpacity key={c.id} style={styles.chip} onPress={() => toggle(c.id)}>
                  <Image source={{ uri: c.avatar }} style={styles.chipAvatar} />
                  <Text style={styles.chipName}>{c.name.split(' ')[0]}</Text>
                  <Ionicons name="close-circle" size={15} color={colors.primary} style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Lista de contactos ── */}
        <View style={styles.contactsSection}>
          <Text style={styles.sectionLabel}>Add People</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar usuarios..."
            placeholderTextColor={colors.placeholder}
          />
          {loadingContacts ? (
            <Text style={{ color: colors.textSecondary, paddingHorizontal: 16, paddingVertical: 10 }}>
              Cargando...
            </Text>
          ) : contacts.length === 0 ? (
            <Text style={{ color: colors.textSecondary, paddingHorizontal: 16, paddingVertical: 10 }}>
              No tienes usuarios para agregar. Sigue a alguien para crear un grupo.
            </Text>
          ) : (
          filteredContacts.map((contact) => {
            const isSelected = selected.has(contact.id);
            return (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactRow}
                activeOpacity={0.7}
                onPress={() => toggle(contact.id)}
              >
                <View style={styles.contactAvatarWrap}>
                  <Image source={{ uri: contact.avatar }} style={styles.contactAvatar} />
                </View>
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color={colors.canvasPure} />}
                </View>
              </TouchableOpacity>
            );
          }))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
