import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../hooks/useDynamicStyles';
import { Radius, Spacing, Typography } from '../theme';
import { useT } from '../i18n';

export type LegalDocumentType = 'terms' | 'privacy' | 'licenses' | null;

interface LegalModalProps {
  documentType: LegalDocumentType;
  onClose: () => void;
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '25',
    },
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
    },
    content: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xxl,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
    },
    paragraph: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 21,
      marginBottom: Spacing.sm,
    },
    closeBtn: {
      padding: 6,
      borderRadius: Radius.md,
    },
  });

export default function LegalModal({ documentType, onClose }: LegalModalProps) {
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const { t } = useT();

  if (!documentType) return null;

  const headerTitle =
    documentType === 'terms'
      ? t('legal.termsTitle')
      : documentType === 'privacy'
        ? t('legal.privacyTitle')
        : t('legal.licensesTitle');

  return (
    <Modal visible={Boolean(documentType)} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{headerTitle}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {documentType === 'terms' && (
            <>
              <Text style={styles.paragraph}>{t('legal.lastUpdated')}</Text>

              <Text style={styles.sectionTitle}>{t('legal.termsUsageTitle')}</Text>
              <Text style={styles.paragraph}>{t('legal.termsUsageText')}</Text>

              <Text style={styles.sectionTitle}>{t('legal.termsContentTitle')}</Text>
              <Text style={styles.paragraph}>{t('legal.termsContentText')}</Text>

              <Text style={styles.sectionTitle}>{t('legal.termsConductTitle')}</Text>
              <Text style={styles.paragraph}>{t('legal.termsConductText')}</Text>
            </>
          )}

          {documentType === 'privacy' && (
            <>
              <Text style={styles.paragraph}>{t('legal.lastUpdated')}</Text>

              <Text style={styles.sectionTitle}>{t('legal.privacyCollectionTitle')}</Text>
              <Text style={styles.paragraph}>{t('legal.privacyCollectionText')}</Text>

              <Text style={styles.sectionTitle}>{t('legal.privacyLocationTitle')}</Text>
              <Text style={styles.paragraph}>{t('legal.privacyLocationText')}</Text>

              <Text style={styles.sectionTitle}>{t('legal.privacySharingTitle')}</Text>
              <Text style={styles.paragraph}>{t('legal.privacySharingText')}</Text>
            </>
          )}

          {documentType === 'licenses' && (
            <>
              <Text style={styles.paragraph}>{t('legal.licensesIntro')}</Text>
              <Text style={styles.sectionTitle}>Expo & React Native (MIT License)</Text>
              <Text style={styles.paragraph}>
                Copyright (c) 650 Industries, Inc. / Meta Platforms, Inc.
              </Text>
              <Text style={styles.sectionTitle}>React Navigation (MIT License)</Text>
              <Text style={styles.paragraph}>
                Software Development Kit for React Native applications.
              </Text>
              <Text style={styles.sectionTitle}>Supabase JS (MIT License)</Text>
              <Text style={styles.paragraph}>
                Official client for authentication, realtime database, and storage.
              </Text>
              <Text style={styles.sectionTitle}>react-native-maps & Ionicons (MIT License)</Text>
              <Text style={styles.paragraph}>
                Map visualization and interface iconography.
              </Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

