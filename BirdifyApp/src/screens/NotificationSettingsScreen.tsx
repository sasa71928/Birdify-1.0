import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/settingsSubScreens.styles';
import { Colors } from '../theme';

const PUSH_NOTIFS = [
  { id: '1', title: 'New Sighting', desc: 'Alerts for rare birds in your area', icon: 'eye-outline', active: true },
  { id: '2', title: 'New Comment', desc: 'When someone replies to your journal', icon: 'chatbubble-outline', active: false },
  { id: '3', title: 'New Follower', desc: 'Stay updated on your community', icon: 'person-add-outline', active: false },
  { id: '4', title: 'Direct Messages', desc: 'Private conversations', icon: 'mail-outline', active: false },
];

const EMAIL_NOTIFS = [
  { id: '5', title: 'Weekly Digest', desc: 'Summary of activity and sightings', icon: 'book-outline' },
  { id: '6', title: 'Account Security', desc: 'Login alerts and password changes', icon: 'shield-checkmark-outline' },
];

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Push Notifications Section */}
        <View style={styles.notifSectionHeader}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          <Text style={styles.notifSectionTitle}>Push Notifications</Text>
        </View>

        {PUSH_NOTIFS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.notifCard, item.active && styles.notifCardActive]}
            activeOpacity={0.7}
          >
            <View style={[styles.notifIconBox, item.active && styles.notifIconBoxActive]}>
              <Ionicons name={item.icon as any} size={22} color={item.active ? Colors.primary : Colors.textPrimary} />
            </View>
            <View style={styles.notifTextContent}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifDesc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Email Notifications Section */}
        <View style={styles.notifSectionHeader}>
          <Text style={[styles.notifSectionTitle, {color: Colors.secondaryBlue}]}>@ Email Notifications</Text>
        </View>

        {EMAIL_NOTIFS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.notifCard}
            activeOpacity={0.7}
          >
            <View style={styles.notifIconBox}>
              <Ionicons name={item.icon as any} size={22} color={Colors.secondaryBlue} />
            </View>
            <View style={styles.notifTextContent}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifDesc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}
