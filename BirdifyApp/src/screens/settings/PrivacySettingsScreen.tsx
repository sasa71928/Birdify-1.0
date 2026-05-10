import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from '../../styles/screens/settings/settingsSubScreens.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

export default function PrivacySettingsScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const [isPrivateProfile, setIsPrivateProfile] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Privacy Settings Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-outline" size={22} color={colors.primary} />
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Private Profile</Text>
              <Text style={styles.settingSublabel}>Only approved followers can see your sightings.</Text>
            </View>
            <Switch
              value={isPrivateProfile}
              onValueChange={setIsPrivateProfile}
              trackColor={{ false: isDark ? '#444' : '#D1D1D1', true: colors.primary }}
              thumbColor={colors.canvasPure}
            />
          </View>
          <View style={styles.settingDivider} />
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <Ionicons name="remove-circle-outline" size={22} color={colors.textPrimary} style={{marginRight: 12}} />
            <Text style={[styles.settingLabel, {flex: 1}]}>Blocked Users</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </TouchableOpacity>
        </View>

        {/* Account Security Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
          <Text style={styles.sectionTitle}>Account Security</Text>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={[styles.settingContent, { opacity: 0.5 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                <View style={{ backgroundColor: '#EEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
                  <Text style={{ fontSize: 10, color: '#666', fontWeight: 'bold' }}>SOON</Text>
                </View>
              </View>
              <Text style={styles.settingSublabel}>Secure your account with a code.</Text>
            </View>
            <Switch
              value={false}
              disabled={true}
              trackColor={{ false: isDark ? '#444' : '#D1D1D1', true: colors.primary }}
              thumbColor={colors.canvasPure}
              style={{ opacity: 0.5 }}
            />
          </View>
          <View style={styles.settingDivider} />
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <MaterialCommunityIcons name="dots-horizontal" size={22} color={colors.textPrimary} style={{marginRight: 12}} />
            <Text style={[styles.settingLabel, {flex: 1}]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8}>
          <View style={{
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.errorRed,
            borderRadius: 4,
            padding: 2,
            marginRight: 8
          }}>
            <Ionicons name="trash-outline" size={16} color={colors.errorRed} />
          </View>
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>
        <Text style={styles.deleteWarning}>
          Deleting your account will permanently remove all your sightings, journals, and data. This action cannot be undone.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

