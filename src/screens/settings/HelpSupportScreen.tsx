import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  LinearTransition,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import { SettingsScaffold } from '../../components/settings';
import { PressableScale } from '../../components/animated';
import { Radius, Typography, Shadows } from '../../theme';

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useDynamicStyles();
  const { user } = useAuth();
  const { t } = useT();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const faqs = [
    {
      id: '1',
      question: t('settings.faq1Q'),
      answer: t('settings.faq1A'),
    },
    {
      id: '2',
      question: t('settings.faq2Q'),
      answer: t('settings.faq2A'),
    },
    {
      id: '3',
      question: t('settings.faq3Q'),
      answer: t('settings.faq3A'),
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleContactSupport = async () => {
    const subject = `Birdify Support - ${user?.email || 'User'}`;
    const body = `Hola equipo de soporte de Birdify,\n\nDescribe tu consulta o problema aquí:\n\nApp Version: 1.0.4\n`;
    const emailUrl = `mailto:birdifysupport@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    const supported = await Linking.canOpenURL(emailUrl).catch(() => false);
    if (supported) {
      await Linking.openURL(emailUrl);
    } else {
      handleError('No se encontró aplicación de correo', setToast);
    }
  };

  return (
    <SettingsScaffold
      title={t('settings.help')}
      subtitle={t('settings.helpSubtitle')}
      onBack={() => navigation.goBack()}
    >
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* FAQs Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t('settings.faqsTitle')}
        </Text>

        {faqs.map((faq) => {
          const isOpen = expandedId === faq.id;
          return (
            <Animated.View
              key={faq.id}
              layout={LinearTransition.springify().damping(20)}
              style={[
                styles.faqCard,
                {
                  backgroundColor: colors.canvasPure,
                  borderColor: isOpen
                    ? colors.primary + '50'
                    : isDark
                    ? colors.border + '30'
                    : colors.border + '20',
                },
              ]}
            >
              <PressableScale
                activeScale={0.98}
                haptic="light"
                onPress={() => toggleExpand(faq.id)}
                style={styles.faqHeader}
                accessibilityRole="button"
                accessibilityLabel={faq.question}
              >
                <Text
                  style={[
                    styles.faqQuestion,
                    {
                      color: isOpen ? colors.primary : colors.textPrimary,
                    },
                  ]}
                >
                  {faq.question}
                </Text>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={isOpen ? colors.primary : colors.textSecondary}
                />
              </PressableScale>

              {isOpen && (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(120)}
                  style={styles.faqBody}
                >
                  <View
                    style={[
                      styles.bodyDivider,
                      { backgroundColor: colors.border + '20' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.faqAnswer,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {faq.answer}
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
      </View>

      {/* Contact Card */}
      <View
        style={[
          styles.contactCard,
          {
            backgroundColor: isDark ? colors.primary + '18' : colors.primary + '0C',
            borderColor: colors.primary + '30',
          },
        ]}
      >
        <View style={styles.contactIconWrap}>
          <Ionicons name="mail" size={26} color={colors.primary} />
        </View>
        <Text style={[styles.contactTitle, { color: colors.textPrimary }]}>
          {t('settings.contactUs')}
        </Text>
        <Text style={[styles.contactDesc, { color: colors.textSecondary }]}>
          {t('settings.contactDesc')}
        </Text>

        <PressableScale
          activeScale={0.96}
          haptic="medium"
          onPress={handleContactSupport}
          style={[
            styles.contactBtn,
            { backgroundColor: colors.primary, ...Shadows.button },
          ]}
        >
          <Text style={styles.contactBtnText}>
            {t('settings.sendEmailBtn')}
          </Text>
        </PressableScale>
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 6,
  },
  faqCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    ...Shadows.card,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    marginRight: 12,
    lineHeight: 20,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bodyDivider: {
    height: 1,
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    lineHeight: 22,
  },
  contactCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  contactIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Shadows.card,
  },
  contactTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    marginBottom: 4,
  },
  contactDesc: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: Radius.md,
  },
  contactBtnText: {
    color: '#FFF',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
});
