import React, { useState, useEffect } from 'react';
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

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';

const DEFAULT_PUSH = [
  { id: '1', title: 'New Sighting', desc: 'Alerts for rare birds in your area', icon: 'eye-outline', active: false },
  { id: '2', title: 'New Comment', desc: 'When someone replies to your journal', icon: 'chatbubble-outline', active: false },
  { id: '3', title: 'New Follower', desc: 'Stay updated on your community', icon: 'person-add-outline', active: false },
  { id: '4', title: 'Direct Messages', desc: 'Private conversations', icon: 'mail-outline', active: false },
];

const DEFAULT_EMAIL = [
  { id: '5', title: 'Weekly Digest', desc: 'Summary of activity and sightings', icon: 'book-outline', active: false },
  { id: '6', title: 'Account Security', desc: 'Login alerts and password changes', icon: 'shield-checkmark-outline', active: false },
];

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const [pushNotifs, setPushNotifs] = useState(DEFAULT_PUSH);
  const [emailNotifs, setEmailNotifs] = useState(DEFAULT_EMAIL);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const { user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('push_notifications, email_notifications')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.push_notifications) {
        const saved = Array.isArray(data.push_notifications) ? data.push_notifications : [];
        setPushNotifs(prev => prev.map(item => {
          const found = saved.find((s: any) => s.id === item.id);
          return found ? { ...item, active: !!found.active } : item;
        }));
      }

      if (data?.email_notifications) {
        const saved = Array.isArray(data.email_notifications) ? data.email_notifications : [];
        setEmailNotifs(prev => prev.map(item => {
          const found = saved.find((s: any) => s.id === item.id);
          return found ? { ...item, active: !!found.active } : item;
        }));
      }
    } catch (e) {
      handleError(e, setToast, 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const togglePush = async (id: string) => {
  try {
    const updated = pushNotifs.map(item =>
      item.id === id
        ? { ...item, active: !item.active }
        : item
    );

    setPushNotifs(updated);

    await supabase
      .from('users')
      .update({
        push_notifications: updated
      })
      .eq('id', user?.id);

  } catch (error) {
    handleError(error, setToast, 'No se pudieron guardar las notificaciones');
  }
};

const toggleEmail = async (id: string) => {
  try {
    const updated = emailNotifs.map(item =>
      item.id === id
        ? { ...item, active: !item.active }
        : item
    );

    setEmailNotifs(updated);

    await supabase
      .from('users')
      .update({
        email_notifications: updated
      })
      .eq('id', user?.id);

  } catch (error) {
    handleError(error, setToast, 'No se pudieron guardar las notificaciones');
  }
};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
      
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
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

