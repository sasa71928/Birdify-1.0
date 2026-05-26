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
import { createStyles } from '../../styles/screens/settings/settingsSubScreens.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Spacing } from '../../theme';

import { Linking, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const FAQS = [
  {
    id: '1',
    question: 'How do I record a bird sighting?',
    answer: 'Go to the Record tab in the main menu, take a photo or select one from your gallery, and fill in the bird details.',
  },
  {
    id: '2',
    question: 'Can I use the app offline?',
    answer: 'Yes! You can download offline packages in the Data & Storage section of settings.',
  },
  {
    id: '3',
    question: 'How do I change my privacy settings?',
    answer: 'Navigate to Settings > Privacy & Security to control who can see your sightings.',
  },
];

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { user } = useAuth();

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleContactSupport = async () => {
  const subject = `Birdify Support Request - ${user?.email || 'Unknown User'}`;

  const body = `Describe your issue here, including steps to reproduce if applicable:

  Device:
  App Version:
    `;

  const emailUrl =
    `mailto:birdifysupport@gmail.com` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  const supported = await Linking.canOpenURL(emailUrl);

  if (supported) {
    await Linking.openURL(emailUrl);
  } else {
    Alert.alert(
      'Error',
      'No se encontró una aplicación de correo disponible.'
    );
  }
};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>Frequently Asked Questions</Text>
        <Text style={styles.subtitle}>Find answers to the most common questions about Birdify.</Text>

        {FAQS.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqItem}
            onPress={() => toggleExpand(faq.id)}
            activeOpacity={0.7}
          >
            <View style={styles.faqQuestion}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expanded === faq.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.placeholder}
              />
            </View>
            {expanded === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.contactCard} activeOpacity={0.8} onPress={handleContactSupport}>
          <View style={{ backgroundColor: colors.primary + '15', padding: Spacing.sm, borderRadius: 12 }}>
            <Ionicons name="mail" size={24} color={colors.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Contact Support</Text>
            <Text style={styles.contactSubtitle}>Get help from our team via email.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.contactCard, { marginTop: Spacing.sm, opacity: 0.5 }]} disabled={true} activeOpacity={1}>
          <View style={{ backgroundColor: colors.secondaryBlue + '15', padding: Spacing.sm, borderRadius: 12 }}>
            <Ionicons name="chatbubbles" size={24} color={colors.secondaryBlue} />
          </View>
          <View style={styles.contactInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.contactTitle}>Community Forum</Text>
              <View style={{ backgroundColor: '#EEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
                <Text style={{ fontSize: 10, color: '#666', fontWeight: 'bold' }}>SOON</Text>
              </View>
            </View>
            <Text style={styles.contactSubtitle}>Ask other users for tips and tricks.</Text>
          </View>
          <Ionicons name="lock-closed-outline" size={18} color={colors.placeholder} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

