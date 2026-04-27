/**
 * InputField — Campo de formulario reutilizable
 *
 * Props:
 *  label            — etiqueta superior del campo
 *  placeholder      — texto de ayuda dentro del input
 *  iconSymbol       — emoji o string corto como ícono izquierdo
 *  secureTextEntry  — oculta el texto (contraseña)
 *  showToggle       — muestra botón ojo para revelar/ocultar
 *  keyboardType     — tipo de teclado
 *  value            — valor controlado
 *  onChangeText     — callback de cambio
 *  editable         — si el campo acepta entrada (default: true)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

type InputFieldProps = {
  label: string;
  placeholder: string;
  iconSymbol: string;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  keyboardType?: KeyboardTypeOptions;
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
};

export default function InputField({
  label,
  placeholder,
  iconSymbol,
  secureTextEntry = false,
  showToggle = false,
  keyboardType = 'default',
  value,
  onChangeText,
  editable = true,
}: InputFieldProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.container}>
        <Text style={styles.icon}>{iconSymbol}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
        />
        {showToggle && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.toggle}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleIcon}>{isSecure ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginLeft: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.sm,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    height: '100%',
  },
  toggle: {
    padding: Spacing.xs,
  },
  toggleIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
});
