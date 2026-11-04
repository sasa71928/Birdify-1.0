import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography, Spacing, Radius } from '../../theme';
import { useT } from '../../i18n';
import { FeedFilterMode } from '../../context/FeedPreferencesContext';

interface FeedEmptyStateProps {
  filterMode: FeedFilterMode;
  onlyVerified: boolean;
  message: string;
  onResetFilters: () => void;
  onOpenPreferences: () => void;
  onNewSighting: () => void;
  colors: any;
}

export const FeedEmptyState: React.FC<FeedEmptyStateProps> = React.memo(({
  filterMode,
  onlyVerified,
  message,
  onResetFilters,
  onOpenPreferences,
  onNewSighting,
  colors,
}) => {
  const { t } = useT();

  const isFiltered = filterMode !== 'all' || onlyVerified;

  const iconName =
    filterMode === 'proximity'
      ? 'location-outline'
      : filterMode === 'following' || filterMode === 'followers' || filterMode === 'mutuals'
      ? 'people-outline'
      : 'leaf-outline';

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primary + '14' }]}>
        <Ionicons name={iconName} size={42} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {isFiltered ? t('feed.filterBadgeAll') : t('feed.emptyCommunity')}
      </Text>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>

      <View style={styles.actionsCol}>
        {isFiltered ? (
          <>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={onResetFilters}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>
                {t('feed.filterBadgeAll')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: colors.componentBase,
                  borderColor: colors.border + '30',
                },
              ]}
              activeOpacity={0.8}
              onPress={onOpenPreferences}
            >
              <Ionicons name="options-outline" size={15} color={colors.textPrimary} />
              <Text style={[styles.secondaryBtnText, { color: colors.textPrimary }]}>
                {t('feed.changePreferencesBtn')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={onNewSighting}
          >
            <Ionicons name="camera" size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>
              {t('feed.newSightingPrompt')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 50,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Typography.fontFamilyDisplay,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: Typography.fontSize.sm + 1,
    fontFamily: Typography.fontFamilyBody,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: Spacing.lg,
  },
  actionsCol: {
    gap: 10,
    width: '100%',
    maxWidth: 240,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: Radius.full,
    gap: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamilyDisplay,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Typography.fontFamilyBody,
  },
});
