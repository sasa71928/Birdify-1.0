import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useT } from '../../i18n';
import { SettingsScaffold } from '../../components/settings';
import { SelectableCard } from '../../components/animated';
import { haptics } from '../../utils/haptics';
import { showSuccess } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import { Radius, Typography } from '../../theme';

export default function ThemeSettingsScreen() {
  const navigation = useNavigation();
  const { theme, setTheme } = useTheme();
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const THEMES = [
    {
      id: 'system' as const,
      name: t('settings.themeSystem'),
      subtitle: 'Sincronizar automáticamente con el sistema operativo',
      icon: 'settings-outline' as const,
      previewColors: ['#F8F8F8', '#121212'],
    },
    {
      id: 'light' as const,
      name: t('settings.themeLight'),
      subtitle: 'Fondo blanco y contrastes nítidos para luz diurna',
      icon: 'sunny-outline' as const,
      previewColors: ['#FFFFFF', '#F2F4F1'],
    },
    {
      id: 'dark' as const,
      name: t('settings.themeDark'),
      subtitle: 'Fondo negro profundo optimizado para pantallas OLED',
      icon: 'moon-outline' as const,
      previewColors: ['#121212', '#1E1E1E'],
    },
  ];

  const handleSelectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === theme) return;
    haptics.selection();
    setTheme(newTheme);
    showSuccess(t('settings.themeChangedToast'), setToast);
  };

  return (
    <SettingsScaffold
      title={t('settings.themeTitle')}
      subtitle={t('settings.themeSubtitle')}
      onBack={() => navigation.goBack()}
    >
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <View style={styles.section}>
        {THEMES.map((item) => {
          const isSelected = theme === item.id;
          return (
            <SelectableCard
              key={item.id}
              selected={isSelected}
              onPress={() => handleSelectTheme(item.id)}
              title={item.name}
              subtitle={item.subtitle}
              leading={
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + '20'
                        : isDark
                        ? '#2A2A2A'
                        : '#F0F2EE',
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={isSelected ? colors.primary : colors.textPrimary}
                  />
                </View>
              }
            />
          );
        })}
      </View>

      {/* Info Notice */}
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
          name="sparkles-outline"
          size={20}
          color={colors.primary}
          style={{ marginTop: 1 }}
        />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {t('settings.themeInfo')}
        </Text>
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
