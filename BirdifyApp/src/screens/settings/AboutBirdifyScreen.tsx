import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from '../../styles/screens/settings/settingsSubScreens.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

export default function AboutBirdifyScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Birdify</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.aboutHeader}>
          <View style={styles.appLogo}>
            <Ionicons name="leaf" size={40} color={colors.canvasPure} />
          </View>
          <Text style={styles.appName}>Birdify</Text>
          <Text style={styles.appVersion}>Version 0.1 (Build 42)</Text>
        </View>

        <Text style={styles.aboutDescription}>
          Birdify is the ultimate companion for bird enthusiasts. Our mission is to connect people with nature and help document the diverse avian life around us.
        </Text>

        <View style={styles.aboutCard}>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="open-outline" size={18} color={colors.placeholder} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={18} color={colors.placeholder} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text style={styles.linkText}>Open Source Licenses</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.linkRow, { borderBottomWidth: 0, opacity: 0.5 }]} disabled={true} activeOpacity={1}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.linkText}>Visit Website</Text>
              <View style={{ backgroundColor: '#EEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
                <Text style={{ fontSize: 10, color: '#666', fontWeight: 'bold' }}>SOON</Text>
              </View>
            </View>
            <Ionicons name="lock-closed-outline" size={16} color={colors.placeholder} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 20 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Made with ❤️ by the Birdify Team</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>© 2026 Birdify Inc. All rights reserved.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

