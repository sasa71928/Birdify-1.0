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
import styles from '../styles/settingsSubScreens.styles';
import { Colors, Spacing } from '../theme';

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
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
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
                color={Colors.outlineGrey}
              />
            </View>
            {expanded === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.contactCard} activeOpacity={0.8}>
          <View style={{ backgroundColor: Colors.primary + '15', padding: Spacing.sm, borderRadius: 12 }}>
            <Ionicons name="mail" size={24} color={Colors.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Contact Support</Text>
            <Text style={styles.contactSubtitle}>Get help from our team via email.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.outlineGrey} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.contactCard, { marginTop: Spacing.sm }]} activeOpacity={0.8}>
          <View style={{ backgroundColor: Colors.secondaryBlue + '15', padding: Spacing.sm, borderRadius: 12 }}>
            <Ionicons name="chatbubbles" size={24} color={Colors.secondaryBlue} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Community Forum</Text>
            <Text style={styles.contactSubtitle}>Ask other users for tips and tricks.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.outlineGrey} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
