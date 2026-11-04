import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedFilterMode, FeedPreferences } from '../../context/FeedPreferencesContext';
import { Typography, Spacing, Radius } from '../../theme';
import { useT } from '../../i18n';
import { PressableScale } from '../animated/PressableScale';

interface FeedCategoryBarProps {
  preferences: FeedPreferences;
  onSelectMode: (mode: FeedFilterMode) => void;
  onRadiusChange: (radius: number) => void;
  onToggleVerified: () => void;
  onOpenPreferences: () => void;
  colors: any;
}

export const FeedCategoryBar: React.FC<FeedCategoryBarProps> = React.memo(({
  preferences,
  onSelectMode,
  onRadiusChange,
  onToggleVerified,
  onOpenPreferences,
  colors,
}) => {
  const { t } = useT();
  const [manualRadius, setManualRadius] = useState(String(preferences.proximityRadiusKm || 50));

  useEffect(() => {
    setManualRadius(String(preferences.proximityRadiusKm || 50));
  }, [preferences.proximityRadiusKm]);

  const handleRadiusInputChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    setManualRadius(clean);
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num > 0 && num <= 999) {
      onRadiusChange(num);
    }
  };

  const categories = [
    {
      id: 'all' as FeedFilterMode,
      label: t('feed.filterBadgeAll'),
      icon: 'earth',
    },
    {
      id: 'following' as FeedFilterMode,
      label: t('feed.filterBadgeFollowing'),
      icon: 'people',
    },
    {
      id: 'proximity' as FeedFilterMode,
      label: `${t('feed.filterOptionProximity')} (${preferences.proximityRadiusKm} km)`,
      icon: 'location',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border + '18',
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isActive = preferences.filterMode === cat.id;
          return (
            <PressableScale
              key={cat.id}
              activeScale={0.95}
              haptic="light"
              onPress={() => onSelectMode(cat.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : colors.componentBase,
                  borderColor: isActive ? colors.primary : colors.border + '25',
                },
              ]}
            >
              <Ionicons
                name={cat.icon as any}
                size={13}
                color={isActive ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isActive ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
              >
                {cat.label}
              </Text>
            </PressableScale>
          );
        })}

        {/* Chip para filtro solo verificados */}
        <PressableScale
          activeScale={0.95}
          haptic="light"
          onPress={onToggleVerified}
          style={[
            styles.chip,
            {
              backgroundColor: preferences.onlyVerified ? colors.secondaryBlue : colors.componentBase,
              borderColor: preferences.onlyVerified ? colors.secondaryBlue : colors.border + '25',
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={13}
            color={preferences.onlyVerified ? '#FFFFFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.chipText,
              {
                color: preferences.onlyVerified ? '#FFFFFF' : colors.textSecondary,
                fontWeight: preferences.onlyVerified ? '700' : '600',
              },
            ]}
          >
            {t('feed.filterOptionOnlyVerified')}
          </Text>
        </PressableScale>

        {/* Botón de Ajustes / Preferencias de Feed */}
        <TouchableOpacity
          style={[
            styles.optionsBtn,
            {
              backgroundColor: colors.componentBase,
              borderColor: colors.border + '25',
            },
          ]}
          activeOpacity={0.7}
          onPress={onOpenPreferences}
          accessibilityLabel={t('feed.preferencesModalTitle')}
        >
          <Ionicons name="options-outline" size={15} color={colors.textPrimary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Input manual de distancia para Proximidad */}
      {preferences.filterMode === 'proximity' && (
        <View
          style={[
            styles.proximityInputBar,
            {
              backgroundColor: colors.componentBase,
              borderTopColor: colors.border + '15',
            },
          ]}
        >
          <View style={styles.proximityLeft}>
            <Ionicons name="navigate-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.proximityLabel, { color: colors.textPrimary }]}>
              Radio:
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.canvasPure,
                  borderColor: colors.primary + '60',
                },
              ]}
            >
              <TextInput
                style={[styles.numericInput, { color: colors.textPrimary }]}
                keyboardType="numeric"
                value={manualRadius}
                onChangeText={handleRadiusInputChange}
                maxLength={4}
                selectTextOnFocus
              />
              <Text style={[styles.kmSuffix, { color: colors.textSecondary }]}>km</Text>
            </View>
          </View>

          {/* Presets rápidos */}
          <View style={styles.presetsRow}>
            {[10, 25, 50, 100].map((preset) => {
              const isSelected = preferences.proximityRadiusKm === preset;
              return (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.canvasPure,
                      borderColor: isSelected ? colors.primary : colors.border + '30',
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => {
                    setManualRadius(String(preset));
                    onRadiusChange(preset);
                  }}
                >
                  <Text
                    style={[
                      styles.presetPillText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontFamily: Typography.fontFamilyBody,
  },
  optionsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proximityInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginTop: 6,
    borderTopWidth: 1,
  },
  proximityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proximityLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.fontFamilyDisplay,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 8,
    height: 28,
  },
  numericInput: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamilyDisplay,
    paddingVertical: 0,
    width: 34,
    textAlign: 'center',
  },
  kmSuffix: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  presetPillText: {
    fontSize: 10.5,
    fontFamily: Typography.fontFamilyDisplay,
  },
});
