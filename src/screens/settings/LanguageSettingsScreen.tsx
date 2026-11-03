import React from 'react';
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
import { createStyles } from '../../styles/screens/settings/settingsSubScreens.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useLanguage, SupportedLanguage } from '../../i18n';

const LANGUAGES: Array<{ id: SupportedLanguage; name: string; code: string }> = [
  { id: 'en', name: 'English', code: 'EN' },
  { id: 'es', name: 'Español', code: 'ES' },
  { id: 'fr', name: 'Français', code: 'FR' },
  { id: 'de', name: 'Deutsch', code: 'DE' },
];

export default function LanguageSettingsScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { language, setLanguage } = useLanguage();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>Select App Language</Text>
        <Text style={styles.subtitle}>
          Choose your preferred language for the interface and bird species names.
        </Text>

        <View style={styles.languageList}>
          {LANGUAGES.map((lang) => {
            const isActive = language === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[styles.languageItem, isActive && styles.languageItemActive]}
                activeOpacity={0.7}
                onPress={() => setLanguage(lang.id)}
              >
                <View style={styles.langIcon}>
                  <Text style={styles.langIconText}>{lang.code}</Text>
                </View>
                <Text style={styles.langName}>{lang.name}</Text>
                <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.secondaryBlue} />
          <Text style={styles.infoText}>
            Changing the language takes effect immediately across chat, messages, search and settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
