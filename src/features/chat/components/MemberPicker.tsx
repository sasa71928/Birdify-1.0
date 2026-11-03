import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Avatar } from '../../../components/ui/Avatar';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius, Typography, Spacing } from '../../../theme';
import { useT } from '../../../i18n';

export interface PickerUser {
  id: string;
  name: string;
  username: string;
  avatar?: string | null;
}

interface MemberPickerProps {
  contacts: PickerUser[];
  selectedIds: Set<string>;
  onToggleUser: (userId: string) => void;
  maxSelection?: number;
}

export const MemberPicker: React.FC<MemberPickerProps> = ({
  contacts,
  selectedIds,
  onToggleUser,
}) => {
  const { colors } = useDynamicStyles();
  const { t } = useT();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const lower = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.username.toLowerCase().includes(lower)
    );
  }, [contacts, searchQuery]);

  const selectedUsers = useMemo(() => {
    return contacts.filter((c) => selectedIds.has(c.id));
  }, [contacts, selectedIds]);

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.componentBase,
            borderColor: colors.border + '30',
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('groups.searchContacts')}
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { color: colors.textPrimary }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Chips de usuarios seleccionados */}
      {selectedUsers.length > 0 && (
        <View style={styles.chipsSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            {t('groups.selectedCount', { count: selectedUsers.length })}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {selectedUsers.map((u) => (
              <TouchableOpacity
                key={u.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.componentBase,
                    borderColor: colors.border + '30',
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => onToggleUser(u.id)}
              >
                <Avatar uri={u.avatar} name={u.name} size={24} />
                <Text
                  style={[styles.chipName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {u.name.split(' ')[0]}
                </Text>
                <Ionicons name="close-circle" size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Lista de contactos */}
      <View style={{ flex: 1, minHeight: 200 }}>
        {contacts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('groups.noContacts')}
            </Text>
          </View>
        ) : (
          <FlashList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <TouchableOpacity
                  style={[
                    styles.contactRow,
                    { borderBottomColor: colors.border + '15' },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => onToggleUser(item.id)}
                >
                  <Avatar uri={item.avatar} name={item.name} size={42} />

                  <View style={styles.contactInfo}>
                    <Text
                      style={[
                        styles.contactName,
                        { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.contactHandle, { color: colors.textSecondary }]}>
                      @{item.username}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: isSelected ? colors.primary : colors.border + '60',
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  chipsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 6,
  },
  chipName: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 90,
  },
  emptyWrap: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
  },
  contactHandle: {
    fontSize: 12.5,
    marginTop: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

