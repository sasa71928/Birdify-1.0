import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from '../../styles/screens/settings/settingsSubScreens.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useTheme } from '../../context/ThemeContext';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';

const THEMES = [
  { id: 'light', name: 'Light Mode', icon: 'sunny-outline' },
  { id: 'dark', name: 'Dark Mode', icon: 'moon-outline' },
  { id: 'system', name: 'System Default', icon: 'settings-outline' },
] as const;


export default function ThemeSettingsScreen() {
  const navigation = useNavigation();
  const { theme, setTheme } = useTheme();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });
  const navTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSave = () => {
    setTheme(selectedTheme);
    handleError(`Birdify is now set to ${THEMES.find(t => t.id === selectedTheme)?.name}`, setToast, 'Theme Updated');
    navTimerRef.current = setTimeout(() => navigation.goBack(), 1000);
  };

  useEffect(() => {
    return () => {
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theme</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>Choose Appearance</Text>
        <Text style={styles.subtitle}>
          Customize how Birdify looks on your device.
        </Text>

        <View style={styles.languageList}>
          {THEMES.map((theme) => {
            const isActive = selectedTheme === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[styles.languageItem, isActive && styles.languageItemActive]}
                activeOpacity={0.7}
                onPress={() => setSelectedTheme(theme.id)}
              >
                <View style={styles.langIcon}>
                  <Ionicons name={theme.icon as any} size={20} color={isActive ? colors.primary : colors.textPrimary} />
                </View>
                <Text style={styles.langName}>{theme.name}</Text>
                <View style={{ flex: 1 }} />
                <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Dark mode is designed to reduce eye strain in low-light environments and save battery life on OLED screens.
          </Text>
        </View>

        <TouchableOpacity style={[styles.saveBtn, { marginTop: 40 }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Appearance</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

