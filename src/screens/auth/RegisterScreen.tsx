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

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();

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
      showToast('Por favor completa todos los campos.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast('Por favor ingresa un correo electrónico válido.', 'error');
      return;
    }

    if (username.trim().length < 3) {
      showToast('El nombre de usuario debe tener al menos 3 caracteres.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('La contraseña y su confirmación deben ser idénticas.', 'error');
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

      showToast('¡Cuenta creada! Revisa tu correo electrónico para confirmarla.', 'success');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } catch (error: any) {
      showToast(error.message || 'Error al registrarse.', 'error');
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
              Únete a la comunidad
            </Text>

            <Text style={shared.heroSubtitle}>
              Comienza tu viaje de observación hoy
            </Text>
          </View>

          {/* ── Formulario ── */}
          <View style={shared.card}>

            <InputField
              label="Nombre completo"
              placeholder="Tu nombre"
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
              label="Nombre de usuario"
              placeholder="birdwatcher_99"
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
              label="Correo electrónico"
              placeholder="ejemplo@birdify.com"
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
              label="Contraseña"
              placeholder="••••••••"
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
              label="Confirmar Contraseña"
              placeholder="••••••••"
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
                  ? 'Registrando...'
                  : 'Crear Cuenta'
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
                O regístrate con
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
              ¿Ya tienes cuenta?
            </Text>

            <Text style={shared.navLink}>
              {' '}Inicia Sesión
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
            Al crear una cuenta, aceptas nuestros{' '}
            <Text
              style={{ color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' }}
              onPress={() => setLegalDoc('terms')}
            >
              Términos de Servicio
            </Text>{' '}
            y{' '}
            <Text
              style={{ color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' }}
              onPress={() => setLegalDoc('privacy')}
            >
              Política de Privacidad
            </Text>
            .
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
