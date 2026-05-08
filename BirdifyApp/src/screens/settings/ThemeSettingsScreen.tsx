import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../../styles/screens/settings/settingsSubScreens.styles';
import { Colors } from '../../theme';

const THEMES = [
  { id: 'light', name: 'Light Mode', icon: 'sunny-outline' },
  { id: 'dark', name: 'Dark Mode', icon: 'moon-outline' },
  { id: 'system', name: 'System Default', icon: 'settings-outline' },
];

export default function ThemeSettingsScreen() {
  const navigation = useNavigation();
  const [selectedTheme, setSelectedTheme] = useState('light');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
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
                  <Ionicons name={theme.icon as any} size={20} color={Colors.textPrimary} />
                </View>
                <Text style={styles.langName}>{theme.name}</Text>
                <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="sparkles-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Dark mode is designed to reduce eye strain in low-light environments and save battery life on OLED screens.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

