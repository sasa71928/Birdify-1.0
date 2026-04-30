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
import AppButton    from '../components/AppButton';
import InputField   from '../components/InputField';
import SocialButton from '../components/SocialButton';

// ── Estilos ───────────────────────────────────────────────────────────────────
import shared from '../styles/shared.styles';
import local  from '../styles/loginScreen.styles';
import { Colors } from '../theme';

// ── Navegación ────────────────────────────────────────────────────────────────
import { RootStackParamList } from '../navigation/AppNavigator';
type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const [remember, setRemember] = useState(false);

  // Link "¿Olvidaste?" que se pasa como labelRight al InputField
  const ForgotLink = (
    <TouchableOpacity activeOpacity={0.7}>
      <Text style={local.forgotLink}>¿Olvidaste tu contraseña?</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

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
            iconSymbol="👤"
            keyboardType="email-address"
          />

          {/* Contraseña con link "¿Olvidaste?" inline en el label */}
          <InputField
            label="Contraseña"
            labelRight={ForgotLink}
            placeholder="••••••••"
            iconSymbol="🔒"
            secureTextEntry
            showToggle
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
            label="Iniciar Sesión →"
            color={Colors.primary}
            style={{ marginBottom: 16 }}
            onPress={() => navigation.navigate('Feed')}
          />

          <View style={shared.dividerRow}>
            <View style={shared.dividerLine} />
            <Text style={shared.dividerText}>O continuar con</Text>
            <View style={shared.dividerLine} />
          </View>

          <View style={shared.socialRow}>
            <SocialButton label="Google"   iconSymbol="🔵" />
            <SocialButton label="Facebook" iconSymbol="📘" />
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
