import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as MailComposer from 'expo-mail-composer';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, useT } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { useFeedPreferences } from '../../context/FeedPreferencesContext';
import { handleError, showSuccess } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import {
  SettingsScaffold,
  SettingsSection,
  SettingsRow,
} from '../../components/settings';
import {
  PressableScale,
  SegmentedControl,
  AnimatedDialog,
} from '../../components/animated';
import { Radius, Typography, Shadows } from '../../theme';

type SettingsNavProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavProp>();
  const { colors, isDark } = useDynamicStyles();
  const { signOut, user, session } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useT();
  const { theme } = useTheme();
  const { preferences: feedPrefs } = useFeedPreferences();

  const feedFilterLabel =
    feedPrefs.filterMode === 'following'
      ? t('settings.feedFilterFollowing')
      : feedPrefs.filterMode === 'followers'
      ? t('settings.feedFilterFollowers')
      : feedPrefs.filterMode === 'mutuals'
      ? t('settings.feedFilterMutuals')
      : feedPrefs.filterMode === 'proximity'
      ? `${feedPrefs.proximityRadiusKm} km`
      : t('settings.feedFilterAll');

  // Verification modal state
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string } | null>(null);

  // Logout confirmation modal state
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Profile metadata
  const userMeta = (user as any)?.user_metadata || {};
  const displayName = userMeta.fullname || userMeta.full_name || t('common.user');
  const displayUsername = userMeta.username || user?.email?.split('@')[0] || 'birdwatcher';
  const avatarUrl =
    userMeta.profile_pic_url ||
    userMeta.avatar_url ||
    'https://gravatar.com/avatar/?d=mp';

  const themeLabel =
    theme === 'dark'
      ? t('settings.themeDark')
      : theme === 'light'
      ? t('settings.themeLight')
      : t('settings.themeSystem');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      setLogoutModalVisible(false);
      await signOut();
    } catch (err) {
      handleError(err, setToast, t('settings.logoutFailed'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSendVerification = async () => {
    if (!selectedFile) return;
    try {
      const isAvailable = await MailComposer.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        const { status } = await MailComposer.composeAsync({
          recipients: ['authbirdify@gmail.com'],
          subject: `${t('settings.verificationTitle')} - ${session?.user?.email || ''}`,
          body: `${t('settings.verificationDesc')} (${selectedFile.name})`,
          attachments: [selectedFile.uri],
        });
        if (status === 'sent') {
          showSuccess(t('settings.requestSent'), setToast);
        }
      } else {
        showSuccess(t('settings.requestSent'), setToast);
      }
    } catch (e) {
      handleError(e, setToast, t('settings.requestFailed'));
    } finally {
      setVerificationModalVisible(false);
      setSelectedFile(null);
    }
  };

  return (
    <SettingsScaffold
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
      onBack={() => navigation.goBack()}
    >
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Profile Card Header */}
      <PressableScale
        activeScale={0.98}
        haptic="light"
        onPress={() => navigation.navigate('Profile', { userId: 'me' })}
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.canvasPure,
            borderColor: isDark ? colors.border + '30' : colors.border + '20',
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('settings.viewProfile')}
      >
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.profileTextWrap}>
          <Text
            numberOfLines={1}
            style={[styles.profileName, { color: colors.textPrimary }]}
          >
            {displayName}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.profileUsername, { color: colors.textSecondary }]}
          >
            @{displayUsername}
          </Text>
          <Text style={[styles.viewProfileText, { color: colors.primary }]}>
            {t('settings.viewProfile')} →
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.outlineGrey + '70'}
        />
      </PressableScale>

      {/* Account Section */}
      <SettingsSection title={t('settings.account')}>
        <SettingsRow
          icon="person-outline"
          iconColor="#2E7D32"
          label={t('settings.editProfile')}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingsRow
          icon="shield-checkmark-outline"
          iconColor="#1565C0"
          label={t('settings.privacy')}
          onPress={() => navigation.navigate('PrivacySettings')}
        />
        <SettingsRow
          icon="notifications-outline"
          iconColor="#EF6C00"
          label={t('settings.notifications')}
          onPress={() => navigation.navigate('NotificationSettings')}
        />
        <SettingsRow
          icon="ribbon-outline"
          iconColor="#6A1B9A"
          label={t('settings.verify')}
          isLast
          onPress={() => setVerificationModalVisible(true)}
        />
      </SettingsSection>

      {/* Preferences Section */}
      <SettingsSection title={t('settings.preferences')}>
        {/* Inline Language Segmented Control */}
        <SettingsRow
          icon="language-outline"
          iconColor="#00838F"
          label={t('settings.language')}
          showChevron={true}
          onPress={() => navigation.navigate('LanguageSettings')}
          rightElement={
            <View style={{ width: 120 }}>
              <SegmentedControl
                height={34}
                compact
                options={[
                  { id: 'es', label: 'ES' },
                  { id: 'en', label: 'EN' },
                ]}
                selectedId={language}
                onSelect={(id) => setLanguage(id as 'es' | 'en')}
              />
            </View>
          }
        />
        <SettingsRow
          icon="moon-outline"
          iconColor="#4527A0"
          label={t('settings.theme')}
          value={themeLabel}
          onPress={() => navigation.navigate('ThemeSettings')}
        />
        <SettingsRow
          icon="options-outline"
          iconColor="#E65100"
          label={t('settings.feedPreferences')}
          sublabel={t('settings.feedPreferencesSubtitle')}
          value={feedFilterLabel}
          onPress={() => navigation.navigate('FeedPreferences')}
        />
        <SettingsRow
          icon="cloud-offline-outline"
          iconColor="#4E342E"
          label={t('settings.offlineStorage')}
          sublabel={t('settings.offlineStorageSubtitle')}
          isLast
          onPress={() => navigation.navigate('OfflineStorage')}
        />
      </SettingsSection>

      {/* Support & About Section */}
      <SettingsSection title={t('settings.support')}>
        <SettingsRow
          icon="help-circle-outline"
          iconColor="#0277BD"
          label={t('settings.help')}
          onPress={() => navigation.navigate('HelpSupport')}
        />
        <SettingsRow
          icon="leaf-outline"
          iconColor="#2E7D32"
          label={t('settings.about')}
          isLast
          onPress={() => navigation.navigate('AboutBirdify')}
        />
      </SettingsSection>

      {/* Actions Section */}
      <SettingsSection title={t('settings.actions')}>
        <SettingsRow
          icon="log-out-outline"
          label={t('settings.logout')}
          danger
          showChevron={false}
          isLast
          onPress={() => setLogoutModalVisible(true)}
        />
      </SettingsSection>

      {/* App Version Info */}
      <View style={styles.footerVersion}>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Birdify v1.0.4
        </Text>
      </View>

      {/* Verification Modal */}
      <AnimatedDialog
        visible={verificationModalVisible}
        onClose={() => setVerificationModalVisible(false)}
      >
        <View style={styles.modalBody}>
          <View
            style={[
              styles.modalIconBox,
              { backgroundColor: colors.primary + '18' },
            ]}
          >
            <Ionicons name="ribbon-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>
            {t('settings.verificationTitle')}
          </Text>
          <Text
            style={[styles.dialogDesc, { color: colors.textSecondary }]}
          >
            {t('settings.verificationDesc')}
          </Text>

          <PressableScale
            activeScale={0.97}
            haptic="light"
            style={[
              styles.filePickerBtn,
              {
                backgroundColor: colors.primary + '12',
                borderColor: colors.primary + '30',
              },
            ]}
            onPress={async () => {
              try {
                const result = await DocumentPicker.getDocumentAsync({
                  type: ['application/pdf', 'image/*'],
                  copyToCacheDirectory: true,
                });
                if (!result.canceled && result.assets?.[0]) {
                  setSelectedFile({
                    uri: result.assets[0].uri,
                    name: result.assets[0].name,
                  });
                }
              } catch (e) {
                handleError(e, setToast, 'Error selecting file');
              }
            }}
          >
            <Ionicons
              name={selectedFile ? 'document-text' : 'cloud-upload-outline'}
              size={20}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              numberOfLines={1}
              style={[styles.filePickerText, { color: colors.primary }]}
            >
              {selectedFile ? selectedFile.name : t('settings.selectFile')}
            </Text>
          </PressableScale>

          <View style={styles.dialogActions}>
            <PressableScale
              activeScale={0.96}
              style={[
                styles.dialogBtn,
                styles.cancelDialogBtn,
                { borderColor: colors.border + '40' },
              ]}
              onPress={() => {
                setVerificationModalVisible(false);
                setSelectedFile(null);
              }}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  { color: colors.textSecondary },
                ]}
              >
                {t('common.cancel')}
              </Text>
            </PressableScale>

            <PressableScale
              activeScale={0.96}
              haptic="medium"
              disabled={!selectedFile}
              style={[
                styles.dialogBtn,
                styles.confirmDialogBtn,
                {
                  backgroundColor: selectedFile
                    ? colors.primary
                    : colors.outlineGrey + '40',
                },
              ]}
              onPress={handleSendVerification}
            >
              <Text style={styles.confirmBtnText}>
                {t('settings.sendRequest')}
              </Text>
            </PressableScale>
          </View>
        </View>
      </AnimatedDialog>

      {/* Logout Confirmation Dialog */}
      <AnimatedDialog
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalBody}>
          <View
            style={[
              styles.modalIconBox,
              { backgroundColor: colors.errorRed + '18' },
            ]}
          >
            <Ionicons name="log-out-outline" size={32} color={colors.errorRed} />
          </View>
          <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>
            {t('settings.logoutConfirmTitle')}
          </Text>
          <Text
            style={[styles.dialogDesc, { color: colors.textSecondary }]}
          >
            {t('settings.logoutConfirmDesc')}
          </Text>

          <View style={styles.dialogActions}>
            <PressableScale
              activeScale={0.96}
              disabled={isLoggingOut}
              style={[
                styles.dialogBtn,
                styles.cancelDialogBtn,
                { borderColor: colors.border + '40' },
              ]}
              onPress={() => setLogoutModalVisible(false)}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  { color: colors.textSecondary },
                ]}
              >
                {t('common.cancel')}
              </Text>
            </PressableScale>

            <PressableScale
              activeScale={0.96}
              haptic="medium"
              disabled={isLoggingOut}
              style={[
                styles.dialogBtn,
                styles.confirmDialogBtn,
                { backgroundColor: colors.errorRed },
              ]}
              onPress={handleLogout}
            >
              <Text style={styles.confirmBtnText}>
                {t('settings.logout')}
              </Text>
            </PressableScale>
          </View>
        </View>
      </AnimatedDialog>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: 24,
    ...Shadows.card,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginRight: 14,
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  profileUsername: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 2,
  },
  viewProfileText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '600',
    marginTop: 4,
  },
  footerVersion: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  versionText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
  },
  modalBody: {
    alignItems: 'center',
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  dialogTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  dialogDesc: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  filePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  filePickerText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '600',
    maxWidth: '85%',
  },
  dialogActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  dialogBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDialogBtn: {
    borderWidth: 1.5,
  },
  confirmDialogBtn: {
    ...Shadows.button,
  },
  cancelBtnText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '600',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
});
