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

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CreateGroup'>;

// ── Contactos de ejemplo ───────────────────────────────────────────────────────
const CONTACTS = [
  { id: '1', name: 'Sarah Jenkins',   avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100', isOnline: true },
  { id: '2', name: 'Mike Thompson',   avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
  { id: '3', name: 'Anna K.',          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100' },
  { id: '4', name: 'Carlos Mendez',   avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
  { id: '5', name: 'Elena Rios',      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
  { id: '6', name: 'David Park',      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
];

export default function CreateGroupScreen() {
  const navigation = useNavigation<NavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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

  const handleCreate = () => {
    if (!canCreate) return;
    
    // Simulate API call
    console.log('Creating group:', { groupName, description, image, members: Array.from(selected) });
    
    // Show success alert or navigate back
    navigation.goBack();
  };

  const canCreate = groupName.trim().length > 0 && selected.size >= 1;

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
          disabled={!canCreate}
          onPress={handleCreate}
        >
          <Text style={[styles.createBtnText, !canCreate && styles.createBtnTextDisabled]}>
            Create
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
              {CONTACTS.filter((c) => selected.has(c.id)).map((c) => (
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
          {CONTACTS.map((contact) => {
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
                  {contact.isOnline && <View style={styles.onlineDot} />}
                </View>
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color={colors.canvasPure} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

