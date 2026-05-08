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
import styles from '../styles/settingsSubScreens.styles';
import { Colors } from '../theme';

export default function AboutBirdifyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Birdify</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.aboutHeader}>
          <View style={styles.appLogo}>
            <Ionicons name="leaf" size={40} color={Colors.white} />
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
            <Ionicons name="open-outline" size={18} color={Colors.outlineGrey} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={18} color={Colors.outlineGrey} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text style={styles.linkText}>Open Source Licenses</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.outlineGrey} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.linkRow, { borderBottomWidth: 0 }]} activeOpacity={0.7}>
            <Text style={styles.linkText}>Visit Website</Text>
            <Ionicons name="globe-outline" size={18} color={Colors.outlineGrey} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 20 }}>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Made with ❤️ by the Birdify Team</Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 10, marginTop: 4 }}>© 2026 Birdify Inc. All rights reserved.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
