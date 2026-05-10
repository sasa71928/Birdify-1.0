import React, { useState } from 'react';
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

const INITIAL_PUSH = [
  { id: '1', title: 'New Sighting', desc: 'Alerts for rare birds in your area', icon: 'eye-outline', active: true },
  { id: '2', title: 'New Comment', desc: 'When someone replies to your journal', icon: 'chatbubble-outline', active: false },
  { id: '3', title: 'New Follower', desc: 'Stay updated on your community', icon: 'person-add-outline', active: false },
  { id: '4', title: 'Direct Messages', desc: 'Private conversations', icon: 'mail-outline', active: true },
];

const INITIAL_EMAIL = [
  { id: '5', title: 'Weekly Digest', desc: 'Summary of activity and sightings', icon: 'book-outline', active: true },
  { id: '6', title: 'Account Security', desc: 'Login alerts and password changes', icon: 'shield-checkmark-outline', active: true },
];

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const [pushNotifs, setPushNotifs] = useState(INITIAL_PUSH);
  const [emailNotifs, setEmailNotifs] = useState(INITIAL_EMAIL);

  const togglePush = (id: string) => {
    setPushNotifs(prev => prev.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  const toggleEmail = (id: string) => {
    setEmailNotifs(prev => prev.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Push Notifications Section */}
        <View style={styles.notifSectionHeader}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          <Text style={styles.notifSectionTitle}>Push Notifications</Text>
        </View>

        {pushNotifs.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.notifCard, item.active && styles.notifCardActive]}
            activeOpacity={0.7}
            onPress={() => togglePush(item.id)}
          >
            <View style={[styles.notifIconBox, item.active && styles.notifIconBoxActive]}>
              <Ionicons name={item.icon as any} size={22} color={item.active ? colors.primary : colors.textPrimary} />
            </View>
            <View style={styles.notifTextContent}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifDesc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Email Notifications Section */}
        <View style={styles.notifSectionHeader}>
           <Ionicons name="mail-outline" size={22} color={colors.secondaryBlue} />
          <Text style={[styles.notifSectionTitle, {color: colors.secondaryBlue}]}>Email Notifications</Text>
        </View>

        {emailNotifs.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.notifCard, item.active && { borderColor: colors.secondaryBlue + '50', backgroundColor: colors.secondaryBlue + '10' }]}
            activeOpacity={0.7}
            onPress={() => toggleEmail(item.id)}
          >
            <View style={[styles.notifIconBox, item.active && { backgroundColor: colors.secondaryBlue + '20' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.active ? colors.secondaryBlue : colors.textPrimary} />
            </View>
            <View style={styles.notifTextContent}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifDesc}>{item.desc}</Text>
            </View>
            <View style={[styles.radioOuter, item.active && { borderColor: colors.secondaryBlue }, { marginLeft: 'auto' }]}>
              {item.active && <View style={[styles.radioInner, { backgroundColor: colors.secondaryBlue }]} />}
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

