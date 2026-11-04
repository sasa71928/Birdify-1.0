import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ── Componentes reutilizables ────────────────────────────────────────────────
import AppButton from '../../components/AppButton';
import InputField from '../../components/InputField';
import SocialButton from '../../components/SocialButton';
import LegalModal, { LegalDocumentType } from '../../components/LegalModal';

// ── Estilos dinámicos ────────────────────────────────────────────────────────
import { createSharedStyles } from '../../styles/shared/shared.styles';
import { createStyles as createLocalStyles } from '../../styles/screens/auth/registerScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

// ── Navegación ────────────────────────────────────────────────────────────────
import { RootStackParamList } from '../../navigation/AppNavigator';

type RegisterNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { AuthService } from '../../services/auth.service';
import AppToast from '../../components/AppToast';
import { useSocialAuth } from '../../hooks/useSocialAuth';
import { useT } from '../../i18n';

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();
  const { t } = useT();

  const {
    colors,
    isDark,
  } = useDynamicStyles(createSharedStyles);

  const {
    shared,
    screen: local,
  } = useDynamicStyles(createLocalStyles);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocumentType>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ visible: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3800);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const { signInWith, loadingProvider, isSocialLoading } = useSocialAuth(
    (msg) => showToast(msg, 'error')
  );
  const isBusy = isLoading || isSocialLoading;

  const handleRegister = async () => {
    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      showToast(t('auth.fillAllFields'), 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast(t('auth.validEmailError'), 'error');
      return;
    }

    if (username.trim().length < 3) {
      showToast(t('auth.usernameMinLength'), 'error');
      return;
    }

    if (password.length < 6) {
      showToast(t('auth.passwordMinLength'), 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast(t('auth.passwordsMustMatch'), 'error');
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.signUp(
        email,
        password,
        username,
        fullName
      );

      showToast(t('auth.accountCreatedCheckEmail'), 'success');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } catch (error: any) {
      showToast(error.message || t('auth.registerFailed'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={shared.safe}>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      <LegalModal documentType={legalDoc} onClose={() => setLegalDoc(null)} />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={shared.keyboardView}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          style={{ backgroundColor: colors.surface }}
          contentContainerStyle={shared.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Hero ── */}
          <View style={shared.heroSection}>
            <Text style={local.heroTitle}>
              {t('auth.registerHeroTitle')}
            </Text>

            <Text style={shared.heroSubtitle}>
              {t('auth.registerHeroSubtitle')}
            </Text>
          </View>

          {/* ── Formulario ── */}
          <View style={shared.card}>

            <InputField
              label={t('auth.fullName')}
              placeholder={t('auth.fullNamePlaceholder')}
              iconSymbol={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
              value={fullName}
              onChangeText={setFullName}
            />

            <InputField
              label={t('auth.username')}
              placeholder={t('auth.usernamePlaceholder')}
              iconSymbol={
                <Ionicons
                  name="at-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
              value={username}
              onChangeText={setUsername}
            />

            <InputField
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              iconSymbol={
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <InputField
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              iconSymbol={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
              secureTextEntry
              showToggle
              value={password}
              onChangeText={setPassword}
            />

            <InputField
              label={t('auth.confirmPassword')}
              placeholder={t('auth.passwordPlaceholder')}
              iconSymbol={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
              secureTextEntry
              showToggle
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <AppButton
              label={
                isLoading
                  ? t('auth.registering')
                  : t('auth.createAccountBtn')
              }
              color={colors.primary}
              style={{
                marginTop: 8,
                marginBottom: 16,
              }}
              onPress={handleRegister}
              disabled={isBusy}
            />

            <View style={shared.dividerRow}>
              <View style={shared.dividerLine} />

              <Text style={shared.dividerText}>
                {t('auth.registerWith')}
              </Text>

              <View style={shared.dividerLine} />
            </View>

            <View style={shared.socialRow}>
              <SocialButton
                label="Google"
                iconSymbol={
                  <FontAwesome5
                    name="google"
                    size={18}
                    color="#DB4437"
                  />
                }
                onPress={() => signInWith('google')}
                loading={loadingProvider === 'google'}
                disabled={isBusy}
              />

              <SocialButton
                label="Facebook"
                iconSymbol={
                  <FontAwesome5
                    name="facebook"
                    size={18}
                    color="#4267B2"
                  />
                }
                onPress={() => signInWith('facebook')}
                loading={loadingProvider === 'facebook'}
                disabled={isBusy}
              />
            </View>

          </View>

          {/* ── Link Login ── */}
          <TouchableOpacity
            style={shared.navRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={shared.navText}>
              {t('auth.haveAccount')}
            </Text>

            <Text style={shared.navLink}>
              {' '}{t('auth.login')}
            </Text>

            <Text style={shared.navArrow}>
              {' '}→
            </Text>
          </TouchableOpacity>

          {/* ── Pie legal ── */}
          <Text
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: colors.textSecondary,
              marginTop: 14,
              marginBottom: 12,
              paddingHorizontal: 16,
              lineHeight: 18,
            }}
          >
            {t('auth.termsNoticeRegister')}{' '}
            <Text
              style={{ color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' }}
              onPress={() => setLegalDoc('terms')}
            >
              {t('auth.termsLink')}
            </Text>{' '}
            {t('auth.and')}{' '}
            <Text
              style={{ color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' }}
              onPress={() => setLegalDoc('privacy')}
            >
              {t('auth.privacyLink')}
            </Text>
            .
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
