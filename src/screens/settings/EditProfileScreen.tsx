import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { createStyles } from '../../styles/screens/settings/editProfileScreen.styles';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n';
import { ProfileRepository } from '../../repositories/profile.repository';
import { supabase } from '../../lib/supabase';
import { handleError, showSuccess } from '../../utils/errorHandler';
import { prepareImageForUpload } from '../../utils/imageCompressor';
import AppToast from '../../components/AppToast';
import { SettingsScaffold } from '../../components/settings';
import { PressableScale, AnimatedSheet } from '../../components/animated';
import { Radius, Typography, Shadows } from '../../theme';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();
  const { t } = useT();

  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await ProfileRepository.getById(user.id);
        if (data) {
          setFullname(data.fullname || '');
          setUsername(data.username || '');
          setEmail(user.email || data.email || '');
          setBio(data.bio || '');
          setAvatar(data.profile_pic_url || '');
        }
      } catch (error) {
        handleError(error, setToast, 'Error loading profile');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const pickAndUploadImage = async (source: 'gallery' | 'camera') => {
    try {
      if (source === 'gallery') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          handleError('Permiso denegado', setToast, 'Acceso a fotos requerido.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          handleError('Permiso denegado', setToast, 'Acceso a cámara requerido.');
          return;
        }
      }

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        exif: false,
      };

      const result =
        source === 'gallery'
          ? await ImagePicker.launchImageLibraryAsync(pickerOptions)
          : await ImagePicker.launchCameraAsync(pickerOptions);

      if (result.canceled || !result.assets?.[0]) return;

      const imageUri = result.assets[0].uri;

      // Vista previa local inmediata para retroalimentación instantánea
      setAvatar(imageUri);
      setAvatarError(false);
      setIsUploadingAvatar(true);

      const prepared = await prepareImageForUpload(imageUri, 'avatar');
      const fileName = `${user!.id}/${Date.now()}.${prepared.fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, prepared.arrayBuffer, {
          contentType: prepared.mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Parámetro de tiempo para invalidar cualquier caché previa del avatar
      const freshUrl = `${publicUrl}?t=${Date.now()}`;
      setAvatar(freshUrl);

      // Persistir de inmediato en la base de datos y Auth
      await ProfileRepository.update(user!.id, {
        profile_pic_url: publicUrl,
      });

      await supabase.auth.updateUser({
        data: {
          profile_pic_url: publicUrl,
        },
      });

      showSuccess(t('settings.photoUploadedSuccess'), setToast);
    } catch (error: any) {
      handleError(error, setToast);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!username.trim()) {
      handleError(t('settings.usernameRequired'), setToast);
      return;
    }

    setIsSaving(true);
    try {
      const sanitizedUsername = username.trim().toLowerCase().replace('@', '');

      // Check unique username
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .ilike('username', sanitizedUsername)
        .neq('id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) {
        handleError(t('settings.usernameTaken'), setToast);
        setIsSaving(false);
        return;
      }

      const finalAvatar = avatar.trim() || 'https://gravatar.com/avatar/?d=mp';

      await ProfileRepository.update(user.id, {
        fullname: fullname.trim() || null,
        username: sanitizedUsername,
        bio: bio.trim() || null,
        profile_pic_url: finalAvatar,
      });

      await supabase.auth.updateUser({
        data: {
          username: sanitizedUsername,
          fullname: fullname.trim(),
          profile_pic_url: finalAvatar,
        },
      });

      showSuccess(t('settings.profileUpdatedSuccess'), setToast);
      navigation.goBack();
    } catch (error: any) {
      handleError(error, setToast);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsScaffold
      title={t('settings.editProfile')}
      subtitle={t('settings.editProfileSubtitle')}
      onBack={() => navigation.goBack()}
    >
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.formContainer}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <PressableScale
              activeScale={0.94}
              haptic="light"
              onPress={() => setSheetVisible(true)}
              style={styles.avatarBtn}
              accessibilityRole="button"
              accessibilityLabel={t('settings.changePhotoTitle')}
            >
              <Image
                source={{
                  uri:
                    !avatarError && avatar && avatar.trim() !== ''
                      ? avatar
                      : 'https://gravatar.com/avatar/?d=mp',
                }}
                style={[styles.avatarImage, { borderColor: colors.primary + '30' }]}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                onError={() => setAvatarError(true)}
              />
              {isUploadingAvatar && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#FFF" />
                </View>
              )}
              <View
                style={[
                  styles.cameraBadge,
                  { backgroundColor: colors.primary, borderColor: colors.surface },
                ]}
              >
                <Ionicons name="camera" size={18} color="#FFF" />
              </View>
            </PressableScale>
            <Text
              style={[styles.changePhotoText, { color: colors.primary }]}
              onPress={() => setSheetVisible(true)}
            >
              {t('settings.changePhotoTitle')}
            </Text>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('settings.fullNameLabel')}
            </Text>
            <TextInput
              value={fullname}
              onChangeText={setFullname}
              placeholder={t('settings.fullNamePlaceholder')}
              placeholderTextColor={colors.outlineGrey + '70'}
              style={[
                styles.input,
                {
                  backgroundColor: colors.componentBase,
                  color: colors.textPrimary,
                  borderColor: colors.border + '30',
                },
              ]}
            />
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('settings.usernameLabel')}
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder={t('settings.usernamePlaceholder')}
              placeholderTextColor={colors.outlineGrey + '70'}
              style={[
                styles.input,
                {
                  backgroundColor: colors.componentBase,
                  color: colors.textPrimary,
                  borderColor: colors.border + '30',
                },
              ]}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('settings.emailLabel')}
            </Text>
            <TextInput
              value={email}
              editable={false}
              style={[
                styles.input,
                {
                  backgroundColor: colors.componentBase,
                  color: colors.textSecondary,
                  borderColor: colors.border + '20',
                  opacity: 0.6,
                },
              ]}
            />
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <View style={styles.bioHeader}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t('settings.bioLabel')}
              </Text>
              <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                {bio.length}/160
              </Text>
            </View>
            <TextInput
              value={bio}
              onChangeText={(text) => {
                if (text.length <= 160) setBio(text);
              }}
              multiline
              maxLength={160}
              placeholder={t('settings.bioPlaceholder')}
              placeholderTextColor={colors.outlineGrey + '70'}
              style={[
                styles.input,
                styles.bioInput,
                {
                  backgroundColor: colors.componentBase,
                  color: colors.textPrimary,
                  borderColor: colors.border + '30',
                },
              ]}
            />
          </View>

          {/* Save Button */}
          <PressableScale
            activeScale={0.97}
            haptic="medium"
            disabled={isSaving}
            onPress={handleSave}
            style={[
              styles.saveBtn,
              { backgroundColor: colors.primary, ...Shadows.button },
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>
                {t('settings.saveProfileChanges')}
              </Text>
            )}
          </PressableScale>
        </View>
      )}

      {/* Photo Picker Top Sheet */}
      <AnimatedSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        position="top"
      >
        <View style={styles.sheetBody}>
          <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
            {t('settings.changePhotoTitle')}
          </Text>
          <Text style={[styles.sheetDesc, { color: colors.textSecondary }]}>
            {t('settings.changePhotoSubtitle')}
          </Text>

          <View style={styles.sheetOptions}>
            <PressableScale
              activeScale={0.97}
              haptic="light"
              style={[
                styles.sheetOptionBtn,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                setSheetVisible(false);
                pickAndUploadImage('camera');
              }}
            >
              <Ionicons
                name="camera"
                size={20}
                color="#FFF"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.sheetOptionText}>
                {t('settings.takePhotoCamera')}
              </Text>
            </PressableScale>

            <PressableScale
              activeScale={0.97}
              haptic="light"
              style={[
                styles.sheetOptionBtn,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                setSheetVisible(false);
                pickAndUploadImage('gallery');
              }}
            >
              <Ionicons
                name="images"
                size={20}
                color="#FFF"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.sheetOptionText}>
                {t('settings.chooseFromGallery')}
              </Text>
            </PressableScale>

            <PressableScale
              activeScale={0.97}
              haptic="light"
              style={[
                styles.sheetOptionBtn,
                {
                  backgroundColor: colors.primary + '15',
                  borderColor: colors.primary + '40',
                  borderWidth: 1,
                },
              ]}
              onPress={async () => {
                setSheetVisible(false);
                const defaultAvatar = 'https://gravatar.com/avatar/?d=mp';
                setAvatar(defaultAvatar);
                setAvatarError(false);
                if (user) {
                  try {
                    await ProfileRepository.update(user.id, {
                      profile_pic_url: defaultAvatar,
                    });
                    await supabase.auth.updateUser({
                      data: { profile_pic_url: defaultAvatar },
                    });
                    showSuccess(t('settings.photoUploadedSuccess'), setToast);
                  } catch (e: any) {
                    handleError(e, setToast);
                  }
                }
              }}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.primary}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.sheetOptionText, { color: colors.primary }]}>
                {t('settings.removeCurrentPhoto')}
              </Text>
            </PressableScale>
          </View>
        </View>
      </AnimatedSheet>
    </SettingsScaffold>
  );
}
