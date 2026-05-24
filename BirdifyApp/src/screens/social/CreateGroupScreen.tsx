import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/social/createGroupScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CreateGroup'>;

interface Contact {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function CreateGroupScreen() {
  const navigation = useNavigation<NavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);

  const [groupName, setGroupName]     = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage]             = useState<string | null>(null);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [contacts, setContacts]       = useState<Contact[]>([]);
  const [loading, setLoading]         = useState(true);
  const [creating, setCreating]       = useState(false);

  // ── Cargar usuarios que sigo ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        if (!userId) return;

        // Ajusta los nombres de columna si tu tabla tiene nombres diferentes
        const { data, error } = await supabase
          .from('follows')
          .select(`
            following_id,
            profiles!follows_following_id_fkey (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('follower_id', userId);

        if (error) throw error;

        const mapped: Contact[] = (data ?? [])
          .map((item: any) => item.profiles)
          .filter(Boolean);

        setContacts(mapped);
      } catch (e) {
        console.error('Error cargando usuarios:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Seleccionar / deseleccionar contacto ─────────────────────────────────
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Seleccionar foto del grupo ────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // ── Crear grupo ───────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;

      // 1. Subir imagen si existe
      let avatarUrl: string | null = null;
      if (image) {
        const ext = image.split('.').pop() ?? 'jpg';
        const fileName = `groups/group_${Date.now()}.${ext}`;
        const response = await fetch(image);
        const blob = await response.blob();
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, blob, { contentType: `image/${ext}` });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('chat-images')
            .getPublicUrl(uploadData.path);
          avatarUrl = urlData.publicUrl;
        }
      }

      // 2. Crear conversación
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          name: groupName.trim(),
          description: description.trim() || null,
          is_group: true,
          created_by: userId,
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      if (convError) throw convError;

      // 3. Insertar miembros
      const members = [
        { conversation_id: conversation.id, user_id: userId, role: 'admin' },
        ...Array.from(selected).map((uid) => ({
          conversation_id: conversation.id,
          user_id: uid,
          role: 'member',
        })),
      ];

      const { error: membersError } = await supabase
        .from('conversation_members')
        .insert(members);

      if (membersError) throw membersError;

      // 4. Navegar al chat del grupo
      navigation.replace('Chat', {
      thread: {
          id: conversation.id,
          name: groupName.trim(),
          avatar: avatarUrl ?? '',
          lastMessage: '',
          time: new Date().toISOString(),
          isGroup: true,
        },
      });
    } catch (e) {
      console.error('Error creando grupo:', e);
      Alert.alert('Error', 'No se pudo crear el grupo. Intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  };

  const canCreate = groupName.trim().length > 0 && selected.size >= 1;

  const getDisplayName = (c: Contact) => c.full_name || c.username;
  const getAvatar = (c: Contact) =>
    c.avatar_url
      ? { uri: c.avatar_url }
      : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(c))}&background=random&size=100` };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
          {creating
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Text style={[styles.createBtnText, !canCreate && styles.createBtnTextDisabled]}>Create</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Foto del grupo ── */}
        <View style={styles.iconSection}>
          <TouchableOpacity style={styles.groupIconCircle} activeOpacity={0.75} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.groupIconImage} />
            ) : (
              <MaterialCommunityIcons name="camera-plus-outline" size={28} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          <Text style={styles.iconHint}>
            {image ? 'Tap to change photo' : 'Tap to add a group photo'}
          </Text>
        </View>

        {/* ── Nombre y descripción ── */}
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

        {/* ── Chips de seleccionados ── */}
        {selected.size > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionLabel}>Selected ({selected.size})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {contacts.filter((c) => selected.has(c.id)).map((c) => (
                <TouchableOpacity key={c.id} style={styles.chip} onPress={() => toggle(c.id)}>
                  <Image source={getAvatar(c)} style={styles.chipAvatar} />
                  <Text style={styles.chipName}>{getDisplayName(c).split(' ')[0]}</Text>
                  <Ionicons name="close-circle" size={15} color={colors.primary} style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Lista de seguidos ── */}
        <View style={styles.contactsSection}>
          <Text style={styles.sectionLabel}>Add People</Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          ) : contacts.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 24, paddingHorizontal: 24 }}>
              Aún no sigues a nadie. Sigue usuarios para agregarlos a un grupo.
            </Text>
          ) : (
            contacts.map((contact) => {
              const isSelected = selected.has(contact.id);
              return (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactRow}
                  activeOpacity={0.7}
                  onPress={() => toggle(contact.id)}
                >
                  <View style={styles.contactAvatarWrap}>
                    <Image source={getAvatar(contact)} style={styles.contactAvatar} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{getDisplayName(contact)}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>@{contact.username}</Text>
                  </View>
                  <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color={colors.canvasPure} />}
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