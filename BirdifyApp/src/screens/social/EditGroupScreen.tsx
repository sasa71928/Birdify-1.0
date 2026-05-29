import React from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/social/createGroupScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useEditGroup } from '../../hooks/useEditGroup';
import AppToast from '../../components/AppToast';

export default function EditGroupScreen() {
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
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
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar usuarios..."
          placeholderTextColor={colors.placeholder}
        />
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
