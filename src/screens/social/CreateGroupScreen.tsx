import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { compressImage } from '../../utils/imageCompressor';
import { Image } from 'expo-image';
import { Typography, Spacing, Radius } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { createStyles } from '../../styles/screens/social/createGroupScreen.styles';
import { useAuth } from '../../context/AuthContext';
import { FollowRepository } from '../../repositories/follow.repository';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import { MemberPicker, PickerUser } from '../../features/chat/components/MemberPicker';
import { useT } from '../../i18n';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CreateGroup'>;

export default function CreateGroupScreen() {
  const navigation = useNavigation<NavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();
  const { t } = useT();

  const [step, setStep] = useState<1 | 2>(1); // 1 = miembros, 2 = detalles de grupo
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contacts, setContacts] = useState<PickerUser[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [creating, setCreating] = useState(false);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    let mounted = true;
    const loadContacts = async () => {
      if (!user) return;
      try {
        setLoadingContacts(true);
        const following = await FollowRepository.getFollowing(user.id);
        const mapped: PickerUser[] = (following || []).map((u: any) => ({
          id: u.id,
          name: u.fullname || u.username || 'Usuario',
          username: u.username || 'user',
          avatar: u.profile_pic_url || null,
        }));
        if (mounted) setContacts(mapped);
      } catch (e) {
        handleError(e, setToast, 'No se pudo cargar la lista de contactos');
      } finally {
        if (mounted) setLoadingContacts(false);
      }
    };
    loadContacts();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const toggleUser = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast(t('chat.imagePermissionDenied'), 'error');
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

  const handleCreateGroup = async () => {
    if (!user || groupName.trim().length === 0 || creating) return;
    try {
      setCreating(true);
      const conversationId = await ConversationRepository.createGroupConversation({
        creatorId: user.id,
        name: groupName.trim(),
        description: description.trim() || undefined,
        avatarUrl: image,
        memberIds: Array.from(selected),
      });

      showToast(t('groups.groupCreated'), 'success');
      // Navegación directa al nuevo chat
      setTimeout(() => {
        navigation.replace('Chat', { conversationId });
      }, 400);
    } catch (e) {
      handleError(e, setToast, 'No se pudo crear el grupo');
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border + '20', backgroundColor: colors.surface },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (step === 2) setStep(1);
            else navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
            ]}
          >
            {t('groups.newGroupTitle')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {step === 1 ? t('groups.stepMembers') : t('groups.stepInfo')}
          </Text>
        </View>

        {step === 1 ? (
          <TouchableOpacity
            style={[
              styles.nextBtn,
              {
                backgroundColor: selected.size > 0 ? colors.primary : colors.componentBase,
              },
            ]}
            disabled={selected.size === 0}
            onPress={() => setStep(2)}
          >
            <Text
              style={[
                styles.nextBtnText,
                { color: selected.size > 0 ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {t('common.next')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.nextBtn,
              {
                backgroundColor:
                  groupName.trim().length > 0 && !creating ? colors.primary : colors.componentBase,
              },
            ]}
            disabled={groupName.trim().length === 0 || creating}
            onPress={handleCreateGroup}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.nextBtnText,
                  { color: groupName.trim().length > 0 ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t('common.create')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Paso 1: Selección de miembros */}
      {step === 1 ? (
        loadingContacts ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <MemberPicker
            contacts={contacts}
            selectedIds={selected}
            onToggleUser={toggleUser}
          />
        )
      ) : (
        /* Paso 2: Detalles del grupo */
        <ScrollView contentContainerStyle={styles.detailsScroll}>
          <View style={styles.avatarPickerSection}>
            <TouchableOpacity
              style={[
                styles.avatarTouch,
                { backgroundColor: colors.componentBase, borderColor: colors.border + '30' },
              ]}
              activeOpacity={0.8}
              onPress={pickImage}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <MaterialCommunityIcons
                  name="camera-plus-outline"
                  size={36}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
            <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
              {image ? t('groups.tapToChangePhoto') : t('groups.tapToAddPhoto')}
            </Text>
          </View>

          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.componentBase, borderColor: colors.border + '20' },
            ]}
          >
            <View style={styles.inputFieldRow}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={22}
                color={colors.primary}
              />
              <TextInput
                style={[
                  styles.formInput,
                  { color: colors.textPrimary, fontFamily: Typography.fontFamilyBody },
                ]}
                placeholder={t('groups.groupNamePlaceholder')}
                placeholderTextColor={colors.placeholder}
                value={groupName}
                onChangeText={setGroupName}
                maxLength={50}
              />
            </View>

            <View style={[styles.fieldDivider, { backgroundColor: colors.border + '15' }]} />

            <View style={styles.inputFieldRow}>
              <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
              <TextInput
                style={[
                  styles.formInput,
                  { color: colors.textPrimary, fontFamily: Typography.fontFamilyBody },
                ]}
                placeholder={t('groups.descriptionPlaceholder')}
                placeholderTextColor={colors.placeholder}
                value={description}
                onChangeText={setDescription}
                maxLength={120}
              />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
