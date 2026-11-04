import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useT } from '../../i18n';
import LegalModal, { LegalDocumentType } from '../../components/LegalModal';
import {
  SettingsScaffold,
  SettingsSection,
  SettingsRow,
} from '../../components/settings';
import { Radius, Typography, Shadows } from '../../theme';

export default function AboutBirdifyScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();
  const [legalDoc, setLegalDoc] = useState<LegalDocumentType>(null);

  return (
    <SettingsScaffold
      title={t('settings.about')}
      subtitle={t('settings.aboutSubtitle')}
      onBack={() => navigation.goBack()}
    >
      <LegalModal documentType={legalDoc} onClose={() => setLegalDoc(null)} />

      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View
          style={[
            styles.appLogo,
            { backgroundColor: colors.primary, ...Shadows.active },
          ]}
        >
          <Ionicons name="leaf" size={44} color="#FFF" />
        </View>
        <Text style={[styles.appName, { color: colors.primary }]}>Birdify</Text>
        <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
          v1.0.4
        </Text>
        <Text style={[styles.appTagline, { color: colors.textPrimary }]}>
          {t('settings.appTagline')}
        </Text>
        <Text style={[styles.appMission, { color: colors.textSecondary }]}>
          {t('settings.aboutMission')}
        </Text>
      </View>

      {/* Legal & Info Section */}
      <SettingsSection>
        <SettingsRow
          icon="document-text-outline"
          label={t('settings.termsOfService')}
          onPress={() => setLegalDoc('terms')}
        />
        <SettingsRow
          icon="shield-checkmark-outline"
          label={t('settings.privacyPolicy')}
          onPress={() => setLegalDoc('privacy')}
        />
        <SettingsRow
          icon="code-slash-outline"
          label={t('settings.openSourceLicenses')}
          onPress={() => setLegalDoc('licenses')}
        />
        <SettingsRow
          icon="globe-outline"
          label={t('settings.visitWebsite')}
          badge={t('common.soon')}
          disabled
          showChevron={false}
          isLast
        />
      </SettingsSection>

      {/* Footer credits */}
      <View style={styles.footer}>
        <Text style={[styles.creditText, { color: colors.textSecondary }]}>
          {t('settings.madeWithLove')}
        </Text>
        <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
          {t('settings.allRightsReserved')}
        </Text>
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  brandHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  appLogo: {
    width: 84,
    height: 84,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  appName: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appVersion: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 10,
  },
  appTagline: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  appMission: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  creditText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 4,
    opacity: 0.8,
  },
});
