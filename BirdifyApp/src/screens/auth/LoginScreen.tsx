import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ── Componentes reutilizables ────────────────────────────────────────────────
import AppButton    from '../../components/AppButton';
import InputField   from '../../components/InputField';
import SocialButton from '../../components/SocialButton';

// ── Estilos ───────────────────────────────────────────────────────────────────
import { createStyles } from '../../styles/screens/auth/loginScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

// ── Navegación ────────────────────────────────────────────────────────────────
import { RootStackParamList } from '../../navigation/AppNavigator';
type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { Alert } from 'react-native';
import { AuthService } from '../../services/auth.service';

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const { shared, screen: local, colors, isDark } = useDynamicStyles(createStyles);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }
    
    setIsLoading(true);
    try {
      await AuthService.signIn(email, password);
      // No necesitamos hacer navigation.navigate aquí porque el AuthProvider 
      // automáticamente cambiará las pantallas al detectar la sesión.
    } catch (error: any) {
      Alert.alert('Error al iniciar sesión', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Link "¿Olvidaste?" que se pasa como labelRight al InputField
  const ForgotLink = (
    <TouchableOpacity activeOpacity={0.7}>
      <Text style={local.forgotLink}>¿Olvidaste tu contraseña?</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/*<ScreenHeader />*/}

      <ScrollView
        contentContainerStyle={shared.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ── */}
        <View style={shared.heroSection}>
          <Text style={local.heroTitle}>Bienvenido</Text>
          <Text style={shared.heroSubtitle}>
            Continúa tu viaje de observación hoy.
          </Text>
        </View>

        {/* ── Formulario ── */}
        <View style={shared.card}>
          <InputField
            label="Usuario o Correo"
            placeholder="nombre@ejemplo.com"
            iconSymbol={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Contraseña con link "¿Olvidaste?" inline en el label */}
          <InputField
            label="Contraseña"
            labelRight={ForgotLink}
            placeholder="••••••••"
            iconSymbol={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            secureTextEntry
            showToggle
            value={password}
            onChangeText={setPassword}
          />

          {/* Recordarme en este dispositivo */}
          <TouchableOpacity
            style={local.rememberRow}
            onPress={() => setRemember(!remember)}
            activeOpacity={0.8}
          >
            <View style={[local.checkbox, remember && local.checkboxChecked]}>
              {remember && <Text style={local.checkmark}>✓</Text>}
            </View>
            <Text style={local.rememberText}>Recordarme en este dispositivo</Text>
          </TouchableOpacity>

          <AppButton
            label={isLoading ? "Iniciando..." : "Iniciar Sesión →"}
            color={colors.primary}
            style={{ marginBottom: 16 }}
            onPress={handleLogin}
            disabled={isLoading}
          />

          <View style={shared.dividerRow}>
            <View style={shared.dividerLine} />
            <Text style={shared.dividerText}>O continuar con</Text>
            <View style={shared.dividerLine} />
          </View>

          <View style={shared.socialRow}>
            <SocialButton label="Google"   iconSymbol={<FontAwesome5 name="google" size={18} color="#DB4437" />} />
            <SocialButton label="Facebook" iconSymbol={<FontAwesome5 name="facebook" size={18} color="#4267B2" />} />
          </View>
        </View>

        {/* ── Link de registro ── */}
        <TouchableOpacity
          style={shared.navRow}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={shared.navText}>¿No tienes cuenta? </Text>
          <Text style={shared.navLink}>Regístrate</Text>
        </TouchableOpacity>

        {/* ── Pie legal ── */}
        <Text style={local.legalText}>
          Al iniciar sesión, aceptas nuestros{' '}
          <Text style={local.legalLink}>Términos de Servicio</Text>
          {' '}y{' '}
          <Text style={local.legalLink}>Política de Privacidad</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

