import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';

// ── Componentes reutilizables ────────────────────────────────────────────────
import AppButton from '../components/AppButton';
import InputField from '../components/InputField';
import AvatarIcon from '../components/AvatarIcon';
import SocialButton from '../components/SocialButton';

// ── Estilos y tema ───────────────────────────────────────────────────────────
import styles from '../styles/registerScreen.styles';
import { Colors } from '../theme';

// Cuando exista el asset real, descomenta esta línea y pásala al prop imageSource:
// const birdAsset = require('../../assets/icon.png');

export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.logoIcon}>🐦</Text>
        <Text style={styles.logoText}>Birdify</Text>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <AvatarIcon
            // imageSource={birdAsset}   ← descomenta cuando tengas el asset
            fallback="🕊️"
            size={80}
            color={Colors.primary}
          />
          <Text style={styles.heroTitle}>Únete a la comunidad</Text>
          <Text style={styles.heroSubtitle}>
            Comienza tu viaje de observación hoy
          </Text>
        </View>

        {/* ── Formulario ──────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <InputField
            label="Nombre completo"
            placeholder="Tu nombre"
            iconSymbol="👤"
          />
          <InputField
            label="Nombre de usuario"
            placeholder="birdwatcher_99"
            iconSymbol="@"
          />
          <InputField
            label="Correo electrónico"
            placeholder="ejemplo@birdify.com"
            iconSymbol="✉️"
            keyboardType="email-address"
          />
          <InputField
            label="Contraseña"
            placeholder="••••••••"
            iconSymbol="🔒"
            secureTextEntry
            showToggle
          />

          {/* ── Botón principal ── */}
          <AppButton
            label="Crear Cuenta"
            color={Colors.primary}
            style={{ marginTop: 8, marginBottom: 16 }}
          />

          {/* ── Divisor ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O regístrate con</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Botones sociales ── */}
          <View style={styles.socialRow}>
            <SocialButton label="Google" iconSymbol="🔵" />
            <SocialButton label="Apple" iconSymbol="🍎" />
          </View>
        </View>

        {/* ── Link de login ───────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.loginRow} activeOpacity={0.7}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <Text style={styles.loginLink}>Inicia Sesión </Text>
          <Text style={styles.loginArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
