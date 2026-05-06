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
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAF9', // Slightly off-white for contrast
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 32, // Matches backBtn width approx to center title
  },

  // Content
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  
  // Section
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Card
  card: {
    backgroundColor: Colors.canvasPure,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.springMoss + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconWrapDanger: {
    backgroundColor: Colors.errorRed + '15',
  },
  itemLabel: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  itemLabelDanger: {
    color: Colors.errorRed,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginLeft: 52 + Spacing.md, // Aligns with text
  },
});
