import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, useT, SupportedLanguage } from '../../i18n';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { SettingsScaffold } from '../../components/settings';
import { SelectableCard } from '../../components/animated';
import { Radius, Typography, Shadows } from '../../theme';

export default function LanguageSettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useDynamicStyles();
  const { language, setLanguage } = useLanguage();
  const { t } = useT();

  const LANGUAGES: Array<{
    id: SupportedLanguage;
    name: string;
    nativeName: string;
    flag: string;
    code: string;
  }> = [
    {
      id: 'es',
      name: t('settings.spanish'),
      nativeName: 'Español (Latinoamérica / España)',
      flag: '🇪🇸',
      code: 'ES',
    },
    {
      id: 'en',
      name: t('settings.english'),
      nativeName: 'English (United States / Global)',
      flag: '🇺🇸',
      code: 'EN',
    },
  ];

  return (
    <SettingsScaffold
      title={t('settings.selectLanguage')}
      subtitle={t('settings.selectLanguageSubtitle')}
      onBack={() => navigation.goBack()}
    >
      {/* Language Options */}
      <View style={styles.section}>
        {LANGUAGES.map((item) => {
          const isSelected = language === item.id;
          return (
            <SelectableCard
              key={item.id}
              selected={isSelected}
              onPress={() => setLanguage(item.id)}
              title={item.name}
              subtitle={item.nativeName}
              trailingBadge={item.code}
              leading={
                <View
                  style={[
                    styles.flagCircle,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + '20'
                        : isDark
                        ? '#2A2A2A'
                        : '#F0F2EE',
                    },
                  ]}
                >
                  <Text style={styles.flagEmoji}>{item.flag}</Text>
                </View>
              }
            />
          );
        })}
      </View>

      {/* Live Preview Card */}
      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: colors.canvasPure,
            borderColor: isDark ? colors.border + '30' : colors.border + '20',
          },
        ]}
      >
        <View style={styles.previewHeader}>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={[styles.previewLabel, { color: colors.primary }]}>
            {t('settings.previewLabel')}
          </Text>
        </View>
        <Text style={[styles.previewText, { color: colors.textPrimary }]}>
          "{t('settings.previewPhrase')}"
        </Text>
      </View>

      {/* Info notice */}
      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: isDark ? colors.primary + '15' : colors.primary + '0C',
            borderColor: colors.primary + '25',
          },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.primary}
          style={{ marginTop: 1 }}
        />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {t('settings.languageInfo')}
        </Text>
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  flagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 22,
  },
  previewCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    ...Shadows.card,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  previewLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  previewText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamilyBody,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
    lineHeight: 18,
  },
});
