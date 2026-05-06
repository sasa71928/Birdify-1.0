/**
 * InputField — Campo de formulario reutilizable
 *
 * Props:
 *  label            — etiqueta superior izquierda
 *  labelRight       — elemento opcional a la derecha del label (ej: link "¿Olvidaste?")
 *  placeholder      — texto de ayuda dentro del input
 *  iconSymbol       — emoji o string corto como ícono izquierdo
 *  secureTextEntry  — oculta el texto (contraseña)
 *  showToggle       — muestra botón ojo para revelar/ocultar
/**
 * InputField — Campo de formulario reutilizable
 *
 * Props:
 *  label            — etiqueta superior izquierda
 *  labelRight       — elemento opcional a la derecha del label (ej: link "¿Olvidaste?")
 *  placeholder      — texto de ayuda dentro del input
 *  iconSymbol       — emoji o string corto como ícono izquierdo
 *  secureTextEntry  — oculta el texto (contraseña)
 *  showToggle       — muestra botón ojo para revelar/ocultar
 *  keyboardType     — tipo de teclado
 *  value            — valor controlado
 *  onChangeText     — callback de cambio
 *  editable         — si el campo acepta entrada (default: true)
 */
import React, { useState, ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../theme';

type InputFieldProps = {
  label: string;
  labelRight?: ReactNode;
  placeholder: string;
  iconSymbol?: ReactNode;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  keyboardType?: KeyboardTypeOptions;
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
};

import styles from '../styles/InputField.styles';

export default function InputField({
  label,
  labelRight,
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
  const hasLabel = label.length > 0 || labelRight;

  return (
    <View style={styles.wrapper}>
      {hasLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      <View style={styles.container}>
        {iconSymbol && (
          <View style={{ marginRight: 8, opacity: 0.7, justifyContent: 'center' }}>
            {typeof iconSymbol === 'string' ? <Text style={{ fontSize: 16 }}>{iconSymbol}</Text> : iconSymbol}
          </View>
        )}
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
            <Ionicons
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {labelRight && <View style={styles.labelRight}>{labelRight}</View>}
    </View>
  );
}
