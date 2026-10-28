import React from 'react';
import { View, Text, Platform, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error';

interface AppToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  floating?: boolean;
  topOffset?: number;
  containerStyle?: ViewStyle;
  onClose?: () => void;
  onPress?: () => void;
}

export default function AppToast({
  visible,
  message,
  type,
  floating = true,
  topOffset,
  containerStyle,
  onClose,
  onPress,
}: AppToastProps) {
  if (!visible) return null;

  const backgroundColor = type === 'success' ? '#2E7D32' : '#C62828';

  return (
    <TouchableOpacity
      activeOpacity={(onClose || onPress) ? 0.9 : 1}
      disabled={!(onClose || onPress)}
      onPress={() => {
        if (onPress) onPress();
        else if (onClose) onClose();
      }}
      style={[
        {
          backgroundColor,
          padding: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        floating
          ? {
              position: 'absolute',
              top: topOffset ?? (Platform.OS === 'ios' ? 80 : 50),
              left: 20,
              right: 20,
              zIndex: 9999,
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            }
          : null,
        containerStyle,
      ]}
    >
      <Ionicons
        name={type === 'success' ? 'checkmark-circle' : 'alert-circle'}
        size={22}
        color="#fff"
      />
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 }}>{message}</Text>
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ marginLeft: 4 }}
        >
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
