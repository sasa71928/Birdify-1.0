import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import styles from '../styles/settingsScreen.styles';

type SettingsNavProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

// ── Item Type ─────────────────────────────────────────────────────────────────
interface SettingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  danger?: boolean;
}

const SETTING_SECTIONS = [
  {
    title: 'Account',
    data: [
      { id: '1', icon: 'person-outline', label: 'Edit Profile' },
      { id: '2', icon: 'lock-closed-outline', label: 'Privacy & Security' },
      { id: '3', icon: 'notifications-outline', label: 'Notifications' },
    ],
  },
  {
    title: 'Preferences',
    data: [
      { id: '4', icon: 'globe-outline', label: 'Language' },
      { id: '5', icon: 'moon-outline', label: 'Theme' },
    ],
  },
  {
    title: 'Data & Storage',
    data: [
      { id: 'offline', icon: 'cloud-offline-outline', label: 'Offline Storage' },
    ],
  },
  {
    title: 'Support & About',
    data: [
      { id: '6', icon: 'help-circle-outline', label: 'Help & Support' },
      { id: '7', icon: 'information-circle-outline', label: 'About Birdify' },
    ],
  },
  {
    title: 'Actions',
    data: [
      { id: '8', icon: 'log-out-outline', label: 'Log Out', danger: true },
    ],
  },
];

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavProp>();

  const handlePress = (item: SettingItem) => {
    if (item.danger) {
      // Temporary logic: navigate back to Login or Welcome
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } else if (item.id === 'offline') {
      navigation.navigate('OfflineStorage' as any);
    } else {
      console.log(`Navigating to ${item.label}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* ── Content ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {SETTING_SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            <View style={styles.card}>
              {section.data.map((item, i) => {
                const isLast = i === section.data.length - 1;
                return (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.itemRow}
                      activeOpacity={0.7}
                      onPress={() => handlePress(item as SettingItem)}
                    >
                      <View style={[styles.iconWrap, item.danger && styles.iconWrapDanger]}>
                        <Ionicons
                          name={item.icon as any}
                          size={20}
                          color={item.danger ? Colors.errorRed : Colors.primary}
                        />
                      </View>
                      
                      <Text style={[styles.itemLabel, item.danger && styles.itemLabelDanger]}>
                        {item.label}
                      </Text>

                      {!item.danger && (
                        <Ionicons name="chevron-forward" size={18} color={Colors.outlineGrey} />
                      )}
                    </TouchableOpacity>

                    {!isLast && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
