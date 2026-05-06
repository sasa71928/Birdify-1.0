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
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

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
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const canCreate = groupName.trim().length > 0 && selected.size >= 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Group</Text>
        <TouchableOpacity
          style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
          disabled={!canCreate}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.createBtnText, !canCreate && styles.createBtnTextDisabled]}>
            Create
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Group icon placeholder ── */}
        <View style={styles.iconSection}>
          <TouchableOpacity style={styles.groupIconCircle} activeOpacity={0.75}>
            <MaterialCommunityIcons name="camera-plus-outline" size={28} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.iconHint}>Tap to add a group photo</Text>
        </View>

        {/* ── Campos del grupo ── */}
        <View style={styles.formCard}>
          <View style={styles.fieldRow}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color={Colors.primary} />
            <TextInput
              style={styles.fieldInput}
              placeholder="Group name"
              placeholderTextColor={Colors.placeholder}
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.fieldRow}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            <TextInput
              style={styles.fieldInput}
              placeholder="Description (optional)"
              placeholderTextColor={Colors.placeholder}
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
                  <Ionicons name="close-circle" size={15} color={Colors.primary} style={{ marginLeft: 2 }} />
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
                  {isSelected && <Ionicons name="checkmark" size={14} color={Colors.canvasPure} />}
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
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  createBtnDisabled: {
    backgroundColor: Colors.componentBase,
  },
  createBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.canvasPure,
  },
  createBtnTextDisabled: {
    color: Colors.outlineGrey,
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
    backgroundColor: Colors.componentBase,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },

  // Form
  formCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.canvasPure,
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
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.componentBase,
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
    color: Colors.textSecondary,
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
    backgroundColor: Colors.springMoss + '40',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '50',
  },
  chipAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  chipName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
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
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  contactAvatarWrap: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.componentBase,
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
    borderColor: Colors.surface,
  },
  contactName: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
