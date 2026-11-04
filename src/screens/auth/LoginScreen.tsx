import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';

// ── Componentes reutilizables ────────────────────────────────────────────────
import AppButton from '../../components/AppButton';
import InputField from '../../components/InputField';
import SocialButton from '../../components/SocialButton';
import LegalModal, { LegalDocumentType } from '../../components/LegalModal';

// ── Estilos ───────────────────────────────────────────────────────────────────
import { createStyles } from '../../styles/screens/auth/loginScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

// ── Navegación ────────────────────────────────────────────────────────────────
import { RootStackParamList } from '../../navigation/AppNavigator';
type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AuthService } from '../../services/auth.service';
import AppToast from '../../components/AppToast';
import { useSocialAuth } from '../../hooks/useSocialAuth';
import { useT } from '../../i18n';

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const { shared, screen: local, colors, isDark } = useDynamicStyles(createStyles);
  const { t } = useT();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(true);
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
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3600);
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

  const handleLogin = async () => {
    if (!email || !password) {
      showToast(t('auth.loginRequiredFields'), 'error');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.signIn(email, password, remember);
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          await Location.requestForegroundPermissionsAsync();
        }
      } catch {
        // Ignorar si falla permiso de ubicacion
      }
    } catch (error: any) {
      const details = error?.message || String(error);
      const cause = error?.cause ? ` (Causa: ${error.cause.message || error.cause})` : '';
      showToast(`${details}${cause}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      showToast(t('auth.enterEmailToReset'), 'error');
      return;
    }
    try {
      const redirectTo = Linking.createURL('auth/reset-password');
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo });
      if (error) throw error;
      showToast(t('auth.recoveryLinkSent'), 'success');
    } catch (err: any) {
      showToast(err.message || t('auth.recoveryError'), 'error');
    }
  };

  const ForgotLink = (
    <TouchableOpacity activeOpacity={0.7} onPress={handleForgotPassword}>
      <Text style={local.forgotLink}>{t('auth.forgotPassword')}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={shared.safe}>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
      <LegalModal documentType={legalDoc} onClose={() => setLegalDoc(null)} />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={shared.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ── */}
        <View style={shared.heroSection}>
          <Text style={local.heroTitle}>{t('auth.welcomeHero')}</Text>
          <Text style={shared.heroSubtitle}>
            {t('auth.loginHeroSubtitle')}
          </Text>
        </View>

        {/* ── Formulario ── */}
        <View style={shared.card}>
          <InputField
            label={t('auth.emailOrUsername')}
            placeholder={t('auth.emailOrUsername')}
            iconSymbol={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <InputField
            label={t('auth.password')}
            labelRight={ForgotLink}
            placeholder={t('auth.passwordPlaceholder')}
            iconSymbol={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            secureTextEntry
            showToggle
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={local.rememberRow}
            onPress={() => setRemember(!remember)}
            activeOpacity={0.8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: remember }}
            accessibilityLabel={t('auth.rememberDevice')}
          >
            <View style={[local.checkbox, remember && local.checkboxChecked]}>
              {remember && <Text style={local.checkmark}>✓</Text>}
            </View>
            <Text style={local.rememberText}>{t('auth.rememberDevice')}</Text>
          </TouchableOpacity>

          <AppButton
            label={isLoading ? t('auth.loggingIn') : t('auth.logInBtn')}
            color={colors.primary}
            style={{ marginBottom: 16 }}
            onPress={handleLogin}
            disabled={isBusy}
          />

          <View style={shared.dividerRow}>
            <View style={shared.dividerLine} />
            <Text style={shared.dividerText}>{t('auth.orContinueWith')}</Text>
            <View style={shared.dividerLine} />
          </View>

          <View style={shared.socialRow}>
            <SocialButton
              label="Google"
              iconSymbol={<FontAwesome5 name="google" size={18} color="#DB4437" />}
              onPress={() => signInWith('google')}
              loading={loadingProvider === 'google'}
              disabled={isBusy}
            />
            <SocialButton
              label="Facebook"
              iconSymbol={<FontAwesome5 name="facebook" size={18} color="#4267B2" />}
              onPress={() => signInWith('facebook')}
              loading={loadingProvider === 'facebook'}
              disabled={isBusy}
            />
          </View>
        </View>

        {/* ── Link de registro ── */}
        <TouchableOpacity
          style={shared.navRow}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={shared.navText}>{t('auth.dontHaveAccount')} </Text>
          <Text style={shared.navLink}>{t('auth.signUp')}</Text>
        </TouchableOpacity>

        {/* ── Pie legal ── */}
        <Text style={local.legalText}>
          {t('auth.termsNoticeLogin')}{' '}
          <Text style={local.legalLink} onPress={() => setLegalDoc('terms')}>
            {t('auth.termsLink')}
          </Text>{' '}
          {t('auth.and')}{' '}
          <Text style={local.legalLink} onPress={() => setLegalDoc('privacy')}>
            {t('auth.privacyLink')}
          </Text>
          .
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
