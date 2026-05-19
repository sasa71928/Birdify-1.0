import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import { AuthService } from '../../services/auth.service';

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();
  const shared = createSharedStyles(Colors);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Faltan datos', 'Por favor ingresa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Contraseñas no coinciden', 'La contraseña y su confirmación deben ser idénticas.');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.signUp(email, password, username, fullName);
      Alert.alert(
        '¡Registro exitoso!', 
        'Tu cuenta ha sido creada. Verifica tu correo electrónico si es requerido.'
      );
      // No necesitamos hacer navigation.navigate aquí porque el AuthProvider 
      // detectará el cambio de sesión automáticamente y cambiará a las pantallas principales.
    } catch (error: any) {
      Alert.alert('Error al registrarse', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

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
              value={fullName}
              onChangeText={setFullName}
            />
            <InputField
              label="Nombre de usuario"
              placeholder="birdwatcher_99"
              iconSymbol={<Ionicons name="at-outline" size={20} color={Colors.textSecondary} />}
              value={username}
              onChangeText={setUsername}
            />
            <InputField
              label="Correo electrónico"
              placeholder="ejemplo@birdify.com"
              iconSymbol={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <InputField
              label="Contraseña"
              placeholder="••••••••"
              iconSymbol={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
              secureTextEntry
              showToggle
              value={password}
              onChangeText={setPassword}
            />

            <InputField
              label="Confirmar Contraseña"
              placeholder="••••••••"
              iconSymbol={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
              secureTextEntry
              showToggle
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <AppButton
              label={isLoading ? "Registrando..." : "Crear Cuenta"}
              color={Colors.primary}
              style={{ marginTop: 8, marginBottom: 16 }}
              onPress={handleRegister}
              disabled={isLoading}
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

