import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

// En producción se reemplaza por <Image> o una librería como react-native-svg
const BirdIcon = () => (
  <View style={styles.birdCircle}>
    {/* Representación simple con texto unicode hasta tener el asset real */}
    <Text style={styles.birdEmoji}>🕊️</Text>
  </View>
);

// ─── Componente de campo de formulario ───────────────────────────────────────
type InputFieldProps = {
  label: string;
  placeholder: string;
  iconSymbol: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  showToggle?: boolean;
};

const InputField = ({
  label,
  placeholder,
  iconSymbol,
  secureTextEntry = false,
  keyboardType = 'default',
  showToggle = false,
}: InputFieldProps) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>{iconSymbol}</Text>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize="none"
          editable={false} // Sin lógica por ahora
        />
        {showToggle && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.toggleButton}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleIcon}>{isSecure ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
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
        {/* ── Hero ── */}
        <View style={styles.heroSection}>
          <BirdIcon />
          <Text style={styles.heroTitle}>Únete a la comunidad</Text>
          <Text style={styles.heroSubtitle}>
            Comienza tu viaje de observación hoy
          </Text>
        </View>

        {/* ── Tarjeta de formulario ── */}
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
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>

          {/* ── Divisor ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O regístrate con</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Botones sociales ── */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Text style={styles.socialIcon}>🔵</Text>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Text style={styles.socialIcon}>🍎</Text>
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Pie de pantalla ── */}
        <TouchableOpacity style={styles.loginRow} activeOpacity={0.7}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <Text style={styles.loginLink}>Inicia Sesión </Text>
          <Text style={styles.loginArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.surface,
  },
  logoIcon: {
    fontSize: 22,
    marginRight: Spacing.xs,
  },
  logoText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  headerDivider: {
    height: 1.5,
    backgroundColor: Colors.headerBorder,
    borderStyle: 'dashed',
    opacity: 0.6,
  },

  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  birdCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  birdEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.loose,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: Typography.lineHeight.normal,
  },

  // Tarjeta
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    ...Shadows.card,
  },

  // Campos
  fieldWrapper: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
    opacity: 0.7,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    height: '100%',
  },
  toggleButton: {
    padding: Spacing.xs,
  },
  toggleIcon: {
    fontSize: 16,
    opacity: 0.6,
  },

  // Botón principal
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.button,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textOnPrimary,
    letterSpacing: 0.3,
  },

  // Divisor
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.sm,
  },

  // Botones sociales
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    height: 46,
    gap: Spacing.xs,
    ...Shadows.card,
  },
  socialIcon: {
    fontSize: 16,
  },
  socialText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },

  // Pie / login
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  loginText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.accent,
  },
  loginArrow: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent,
    fontWeight: Typography.fontWeight.bold,
  },
});
