import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Typography, Spacing, Radius } from '../../theme';
import { getServerUrl, setServerUrl } from '../../lib/supabase';
import AppToast from '../../components/AppToast';

export const createStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: colors.textPrimary },
  placeholder: { width: 32 },
  content: { padding: Spacing.md },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: colors.canvasPure,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: colors.textPrimary,
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.md,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveBtnText: {
    color: colors.canvasPure,
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.md,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: Spacing.md,
    lineHeight: 20,
  }
});

export default function ServerConfigScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const [url, setUrl] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    getServerUrl().then(setUrl);
  }, []);

  const handleSave = async () => {
    try {
      // Validate URL roughly
      new URL(url);
      await setServerUrl(url.trim());
      setToast({ visible: true, message: 'Server URL updated successfully. Please restart the app if you experience issues.', type: 'success' });
      // Go back after a short delay
      setTimeout(() => navigation.goBack(), 2000);
    } catch (e) {
      setToast({ visible: true, message: 'Please enter a valid URL (e.g., http://192.168.0.x:8000)', type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Server Configuration</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Supabase Server URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="http://192.168.0.x:8000"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          keyboardType="url"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Configuration</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          If you are testing on a real device, make sure your computer and phone are on the same Wi-Fi network, and use your computer's local IP address.
        </Text>
      </View>
    </SafeAreaView>
  );
}
