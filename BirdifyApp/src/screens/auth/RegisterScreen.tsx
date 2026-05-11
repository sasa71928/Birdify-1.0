import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ── Componentes reutilizables ────────────────────────────────────────────────
import ScreenHeader from '../../components/ScreenHeader';
import AppButton    from '../../components/AppButton';
import InputField   from '../../components/InputField';
import AvatarIcon   from '../../components/AvatarIcon';
import SocialButton from '../../components/SocialButton';

// ── Estilos ───────────────────────────────────────────────────────────────────
import {createSharedStyles}  from '../../styles/shared/shared.styles';
import local   from '../../styles/screens/auth/registerScreen.styles';
import { Colors } from '../../theme';

// ── Navegación ────────────────────────────────────────────────────────────────
import { RootStackParamList } from '../../navigation/AppNavigator';
type RegisterNavProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Cuando exista el asset real, descomenta y pasa al prop imageSource:
// const birdAsset = require('../../assets/icon.png');

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();
  const shared = createSharedStyles(Colors);

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/*<ScreenHeader />*/}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={shared.keyboardView}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={shared.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero ── */}
          <View style={shared.heroSection}>
            <Text style={local.heroTitle}>Únete a la comunidad</Text>
            <Text style={shared.heroSubtitle}>
              Comienza tu viaje de observación hoy
            </Text>
          </View>

          {/* ── Formulario ── */}
          <View style={shared.card}>
            <InputField
              label="Nombre completo"
              placeholder="Tu nombre"
              iconSymbol={<Ionicons name="person-outline" size={20} color={Colors.textSecondary} />}
            />
            <InputField
              label="Nombre de usuario"
              placeholder="birdwatcher_99"
              iconSymbol={<Ionicons name="at-outline" size={20} color={Colors.textSecondary} />}
            />
            <InputField
              label="Correo electrónico"
              placeholder="ejemplo@birdify.com"
              iconSymbol={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
              keyboardType="email-address"
            />
            <InputField
              label="Contraseña"
              placeholder="••••••••"
              iconSymbol={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
              secureTextEntry
              showToggle
            />

            <InputField
              label="Confirmar Contraseña"
              placeholder="••••••••"
              iconSymbol={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
              secureTextEntry
              showToggle
            />

            <AppButton
              label="Crear Cuenta"
              color={Colors.primary}
              style={{ marginTop: 8, marginBottom: 16 }}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
            />

            <View style={shared.dividerRow}>
              <View style={shared.dividerLine} />
              <Text style={shared.dividerText}>O regístrate con</Text>
              <View style={shared.dividerLine} />
            </View>

            <View style={shared.socialRow}>
              <SocialButton label="Google" iconSymbol={<FontAwesome5 name="google" size={18} color="#DB4437" />} />
              <SocialButton label="Facebook"  iconSymbol={<FontAwesome5 name="facebook" size={18} color="#4267B2" />} />
            </View>
          </View>

          {/* ── Link de login ── */}
          <TouchableOpacity
            style={shared.navRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={shared.navText}>¿Ya tienes cuenta? </Text>
            <Text style={shared.navLink}>Inicia Sesión </Text>
            <Text style={shared.navArrow}>→</Text>
          </TouchableOpacity>
        </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

