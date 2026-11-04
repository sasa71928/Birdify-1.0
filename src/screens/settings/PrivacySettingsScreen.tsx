import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { createStyles } from '../../styles/screens/settings/privacySettingsScreen.styles';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n';
import { supabase } from '../../lib/supabase';
import { ProfileRepository } from '../../repositories/profile.repository';
import { handleError, showSuccess } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import {
  SettingsScaffold,
  SettingsSection,
  SettingsRow,
} from '../../components/settings';
import {
  AnimatedSwitch,
  AnimatedDialog,
  PressableScale,
} from '../../components/animated';
import { Radius, Typography, Shadows } from '../../theme';

const USER_STORAGE_BUCKETS = ['avatars', 'Sightings', 'sightings', 'sighting-images', 'group-avatars'] as const;

async function purgeUserStorageObjects(userId: string): Promise<void> {
  await Promise.all(
    USER_STORAGE_BUCKETS.map(async (bucket) => {
      try {
        const { data: items, error } = await supabase.storage.from(bucket).list(userId, { limit: 500 });
        if (error || !items || items.length === 0) return;

        const paths = items
          .filter((item) => Boolean(item.name))
          .map((item) => `${userId}/${item.name}`);

        if (paths.length > 0) {
          await supabase.storage.from(bucket).remove(paths);
        }
      } catch {
        // Ignorar buckets no existentes o sin permisos
      }
    })
  );
}

export default function PrivacySettingsScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user, signOut } = useAuth();
  const { t } = useT();

  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Password modal states
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const targetDeleteWord = t('settings.deleteWord');

  useEffect(() => {
    const loadPrivacy = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_private')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsPrivateProfile(Boolean(data?.is_private));
      } catch (error) {
        handleError(error, setToast, 'Error loading privacy settings');
      }
    };

    loadPrivacy();
  }, [user]);

  const handleTogglePrivateProfile = async (nextValue: boolean) => {
    if (!user || isSavingPrivacy) return;
    const previous = isPrivateProfile;
    setIsPrivateProfile(nextValue);
    setIsSavingPrivacy(true);

    try {
      await ProfileRepository.update(user.id, { is_private: nextValue });
      showSuccess(
        nextValue
          ? t('settings.privateProfileToastOn')
          : t('settings.privateProfileToastOff'),
        setToast
      );
    } catch (error) {
      handleError(error, setToast, 'Failed to update privacy');
      setIsPrivateProfile(previous);
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      handleError('Completa todos los campos', setToast);
      return;
    }
    if (newPassword !== confirmPassword) {
      handleError(t('settings.passwordsDoNotMatch'), setToast);
      return;
    }
    if (newPassword.length < 6) {
      handleError(t('settings.passwordMinLength'), setToast);
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (authError) {
        handleError(t('settings.wrongCurrentPassword'), setToast);
        setIsChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      showSuccess(t('settings.changePasswordSuccess'), setToast);
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      handleError(err, setToast);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== targetDeleteWord.toUpperCase()) {
      handleError(`Escribe ${targetDeleteWord}`, setToast);
      return;
    }
    if (!user) return;

    setIsDeleting(true);
    try {
      await purgeUserStorageObjects(user.id);
      const { error: rpcError } = await supabase.rpc('delete_user');
      if (rpcError) {
        const { error: dbError } = await supabase.from('users').delete().eq('id', user.id);
        if (dbError) throw dbError;
      }
      setDeleteModalVisible(false);
      await signOut();
    } catch (err: any) {
      handleError(err, setToast, t('settings.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const isDeleteWordMatch =
    deleteConfirmationText.trim().toUpperCase() === targetDeleteWord.toUpperCase();

  return (
    <SettingsScaffold
      title={t('settings.privacyTitle')}
      subtitle={t('settings.privacySubtitle')}
      onBack={() => navigation.goBack()}
    >
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Privacy Section */}
      <SettingsSection title={t('settings.privacySection')}>
        <SettingsRow
          icon="eye-off-outline"
          label={t('settings.privateProfile')}
          sublabel={t('settings.privateProfileDesc')}
          showChevron={false}
          rightElement={
            <AnimatedSwitch
              value={isPrivateProfile}
              disabled={isSavingPrivacy}
              onValueChange={handleTogglePrivateProfile}
              accessibilityLabel={t('settings.privateProfile')}
            />
          }
        />
        <SettingsRow
          icon="ban-outline"
          iconColor="#C62828"
          label={t('settings.blockedUsers')}
          isLast
          onPress={() => navigation.navigate('BlockedUsers' as never)}
        />
      </SettingsSection>

      {/* Security Section */}
      <SettingsSection title={t('settings.securitySection')}>
        <SettingsRow
          icon="shield-outline"
          label={t('settings.twoFactor')}
          sublabel={t('settings.twoFactorDesc')}
          badge={t('common.soon')}
          showChevron={false}
          disabled
          rightElement={
            <AnimatedSwitch
              value={false}
              disabled
              onValueChange={() => {}}
              accessibilityLabel={t('settings.twoFactor')}
            />
          }
        />
        <SettingsRow
          icon="key-outline"
          iconColor="#1565C0"
          label={t('settings.changePassword')}
          isLast
          onPress={() => setPasswordModalVisible(true)}
        />
      </SettingsSection>

      {/* Delete Account Button */}
      <View style={{ marginTop: 8 }}>
        <PressableScale
          activeScale={0.97}
          haptic="medium"
          onPress={() => {
            setDeleteConfirmationText('');
            setDeleteModalVisible(true);
          }}
          style={[
            styles.deleteBtn,
            {
              backgroundColor: colors.errorRed + '14',
              borderColor: colors.errorRed + '35',
            },
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={colors.errorRed}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.deleteBtnText, { color: colors.errorRed }]}>
            {t('settings.deleteAccount')}
          </Text>
        </PressableScale>
        <Text style={[styles.deleteWarning, { color: colors.textSecondary }]}>
          {t('settings.deleteAccountWarning')}
        </Text>
      </View>

      {/* Change Password Dialog */}
      <AnimatedDialog
        visible={passwordModalVisible}
        onClose={() => {
          if (!isChangingPassword) setPasswordModalVisible(false);
        }}
      >
        <View style={styles.dialogBody}>
          <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>
            {t('settings.changePassword')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('settings.currentPassword')}
            </Text>
            <TextInput
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.outlineGrey + '80'}
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

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('settings.newPassword')}
            </Text>
            <TextInput
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.outlineGrey + '80'}
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

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('settings.confirmNewPassword')}
            </Text>
            <TextInput
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.outlineGrey + '80'}
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

          <View style={styles.dialogActions}>
            <PressableScale
              activeScale={0.96}
              disabled={isChangingPassword}
              style={[
                styles.dialogBtn,
                { borderColor: colors.border + '40', borderWidth: 1.5 },
              ]}
              onPress={() => setPasswordModalVisible(false)}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>
                {t('common.cancel')}
              </Text>
            </PressableScale>

            <PressableScale
              activeScale={0.96}
              haptic="medium"
              disabled={isChangingPassword}
              style={[
                styles.dialogBtn,
                { backgroundColor: colors.primary, ...Shadows.button },
              ]}
              onPress={handleChangePassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={{ color: '#FFF', fontWeight: '700' }}>
                  {t('common.save')}
                </Text>
              )}
            </PressableScale>
          </View>
        </View>
      </AnimatedDialog>

      {/* Delete Account Dialog */}
      <AnimatedDialog
        visible={deleteModalVisible}
        onClose={() => {
          if (!isDeleting) setDeleteModalVisible(false);
        }}
      >
        <View style={styles.dialogBody}>
          <View
            style={[
              styles.deleteIconBox,
              { backgroundColor: colors.errorRed + '20' },
            ]}
          >
            <Ionicons name="warning-outline" size={32} color={colors.errorRed} />
          </View>

          <Text style={[styles.dialogTitle, { color: colors.errorRed }]}>
            {t('settings.deleteModalTitle')}
          </Text>
          <Text style={[styles.dialogDesc, { color: colors.textSecondary }]}>
            {t('settings.deleteModalDesc')}
          </Text>

          <View
            style={[
              styles.deleteBulletsBox,
              { backgroundColor: colors.componentBase },
            ]}
          >
            <Text style={[styles.bulletItem, { color: colors.textPrimary }]}>
              • {t('settings.deleteBullet1')}
            </Text>
            <Text style={[styles.bulletItem, { color: colors.textPrimary }]}>
              • {t('settings.deleteBullet2')}
            </Text>
            <Text style={[styles.bulletItem, { color: colors.textPrimary }]}>
              • {t('settings.deleteBullet3')}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('settings.deletePrompt', { word: targetDeleteWord })}
            </Text>
            <TextInput
              value={deleteConfirmationText}
              onChangeText={setDeleteConfirmationText}
              placeholder={targetDeleteWord}
              autoCapitalize="characters"
              placeholderTextColor={colors.outlineGrey + '70'}
              style={[
                styles.input,
                {
                  backgroundColor: colors.componentBase,
                  color: colors.textPrimary,
                  borderColor: isDeleteWordMatch
                    ? colors.errorRed
                    : colors.border + '30',
                },
              ]}
            />
          </View>

          <View style={styles.dialogActions}>
            <PressableScale
              activeScale={0.96}
              disabled={isDeleting}
              style={[
                styles.dialogBtn,
                { borderColor: colors.border + '40', borderWidth: 1.5 },
              ]}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>
                {t('common.cancel')}
              </Text>
            </PressableScale>

            <PressableScale
              activeScale={0.96}
              haptic="medium"
              disabled={!isDeleteWordMatch || isDeleting}
              style={[
                styles.dialogBtn,
                {
                  backgroundColor: isDeleteWordMatch
                    ? colors.errorRed
                    : colors.outlineGrey + '40',
                },
              ]}
              onPress={confirmDeleteAccount}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={{ color: '#FFF', fontWeight: '700' }}>
                  {t('common.delete')}
                </Text>
              )}
            </PressableScale>
          </View>
        </View>
      </AnimatedDialog>
    </SettingsScaffold>
  );
}
