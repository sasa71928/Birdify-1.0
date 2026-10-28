import React, { useState, ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useDynamicStyles } from '../hooks/useDynamicStyles';
import { createStyles } from '../styles/components/InputField.styles';

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

  const { colors, screen: styles } = useDynamicStyles(createStyles);

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
          <View
            style={{
              marginRight: 8,
              opacity: 0.7,
              justifyContent: 'center',
            }}
          >
            {typeof iconSymbol === 'string'
              ? <Text style={{ fontSize: 16 }}>{iconSymbol}</Text>
              : iconSymbol}
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
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
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {labelRight && (
        <View style={styles.labelRight}>
          {labelRight}
        </View>
      )}
    </View>
  );
}