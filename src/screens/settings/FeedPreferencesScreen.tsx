import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useT } from '../../i18n';
import {
  useFeedPreferences,
  FeedFilterMode,
} from '../../context/FeedPreferencesContext';
import {
  SettingsScaffold,
  SettingsSection,
} from '../../components/settings';
import {
  SelectableCard,
  SegmentedControl,
  SegmentOption,
  AnimatedSwitch,
  PressableScale,
} from '../../components/animated';
import AppToast from '../../components/AppToast';
import { Typography, Radius, Spacing, Shadows } from '../../theme';
import { haptics } from '../../utils/haptics';

export default function FeedPreferencesScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  const {
    preferences,
    setFilterMode,
    setProximityRadius,
    setOnlyVerified,
    requestLocation,
    locationPermissionGranted,
  } = useFeedPreferences();

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string) => {
    setToast({ visible: true, message, type: 'success' });
  };

  const filterOptions: {
    id: FeedFilterMode;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description: string;
  }[] = [
    {
      id: 'all',
      icon: 'earth-outline',
      label: t('settings.feedFilterAll'),
      description: t('settings.feedFilterAllDesc'),
    },
    {
      id: 'following',
      icon: 'people-outline',
      label: t('settings.feedFilterFollowing'),
      description: t('settings.feedFilterFollowingDesc'),
    },
    {
      id: 'followers',
      icon: 'person-add-outline',
      label: t('settings.feedFilterFollowers'),
      description: t('settings.feedFilterFollowersDesc'),
    },
    {
      id: 'mutuals',
      icon: 'heart-outline',
      label: t('settings.feedFilterMutuals'),
      description: t('settings.feedFilterMutualsDesc'),
    },
    {
      id: 'proximity',
      icon: 'navigate-outline',
      label: t('settings.feedFilterProximity'),
      description: t('settings.feedFilterProximityDesc'),
    },
  ];

  const radiusOptions: SegmentOption<string>[] = [
    { id: '10', label: '10 km' },
    { id: '25', label: '25 km' },
    { id: '50', label: '50 km' },
    { id: '100', label: '100 km' },
  ];

  const handleSelectMode = async (mode: FeedFilterMode) => {
    haptics.selection();
    if (mode === 'proximity' && !locationPermissionGranted) {
      const loc = await requestLocation();
      if (!loc) {
        Alert.alert(
          t('settings.feedFilterProximity'),
          t('settings.proximityPermissionRequired')
        );
      }
    }
    await setFilterMode(mode);
    showToast(t('settings.preferencesSaved'));
  };

  const handleRadiusChange = async (radiusStr: string) => {
    haptics.selection();
    const radius = parseInt(radiusStr, 10) || 50;
    await setProximityRadius(radius);
    showToast(t('settings.preferencesSaved'));
  };

  const handleVerifiedToggle = async (val: boolean) => {
    await setOnlyVerified(val);
    showToast(t('settings.preferencesSaved'));
  };

  return (
    <SettingsScaffold
      title={t('settings.feedPreferences')}
      subtitle={t('settings.feedPreferencesSubtitle')}
      onBack={() => navigation.goBack()}
    >
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Modo de Publicaciones */}
      <SettingsSection
        title={t('settings.feedFilterTitle')}
        footer={t('settings.feedFilterSubtitle')}
      >
        <View style={styles.cardList}>
          {filterOptions.map((opt) => (
            <SelectableCard
              key={opt.id}
              selected={preferences.filterMode === opt.id}
              onPress={() => handleSelectMode(opt.id)}
              leading={
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        preferences.filterMode === opt.id
                          ? colors.primary + '20'
                          : colors.componentBase,
                    },
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={
                      preferences.filterMode === opt.id
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                </View>
              }
              title={opt.label}
              subtitle={opt.description}
            />
          ))}
        </View>
      </SettingsSection>

      {/* Configuración de Proximidad (si está activo el modo) */}
      {preferences.filterMode === 'proximity' && (
        <SettingsSection
          title={t('settings.proximityRadius')}
          footer={t('settings.proximityRadiusDesc')}
        >
          <View
            style={[
              styles.proximityBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border + '30',
              },
            ]}
          >
            <View style={styles.radiusHeader}>
              <Ionicons
                name="locate-outline"
                size={20}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.radiusTitle,
                  { color: colors.textPrimary },
                ]}
              >
                {preferences.proximityRadiusKm} km
              </Text>
            </View>

            <SegmentedControl
              options={radiusOptions}
              selectedId={String(preferences.proximityRadiusKm)}
              onSelect={handleRadiusChange}
            />

            {!locationPermissionGranted && (
              <PressableScale
                activeScale={0.98}
                haptic="light"
                onPress={requestLocation}
                style={[
                  styles.permissionWarning,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Ionicons
                  name="warning-outline"
                  size={18}
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.permissionWarningText,
                    { color: colors.primary },
                  ]}
                >
                  {t('settings.proximityPermissionRequired')}
                </Text>
              </PressableScale>
            )}
          </View>
        </SettingsSection>
      )}

      {/* Filtros Adicionales */}
      <SettingsSection
        title={t('settings.additionalFilters')}
      >
        <View
          style={[
            styles.toggleCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border + '25',
            },
          ]}
        >
          <View style={styles.toggleTextCol}>
            <View style={styles.toggleRowHeader}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.toggleTitle,
                  { color: colors.textPrimary },
                ]}
              >
                {t('settings.onlyVerifiedPosts')}
              </Text>
            </View>
            <Text
              style={[
                styles.toggleDesc,
                { color: colors.textSecondary },
              ]}
            >
              {t('settings.onlyVerifiedPostsDesc')}
            </Text>
          </View>

          <AnimatedSwitch
            value={preferences.onlyVerified}
            onValueChange={handleVerifiedToggle}
          />
        </View>
      </SettingsSection>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  cardList: {
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proximityBox: {
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radiusTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 10,
    borderRadius: Radius.md,
  },
  permissionWarningText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
    fontWeight: '600',
    flex: 1,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 12,
  },
  toggleRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  toggleTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
    lineHeight: 17,
  },
});
