import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { useT } from '../../../i18n';
import { PressableScale } from '../../../components/animated';
import { Typography } from '../../../theme';

export type ProfileTabType = 'Sightings' | 'Logbook' | 'Likes';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
  sightingsCount: number;
  speciesCount: number;
  likesCount: number;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  sightingsCount,
  speciesCount,
  likesCount,
}) => {
  const { colors } = useDynamicStyles();
  const { t } = useT();

  const tabs: {
    id: ProfileTabType;
    label: string;
    count: number;
    icon: (color: string) => React.ReactNode;
  }[] = [
    {
      id: 'Sightings',
      label: t('profile.tabSightings'),
      count: sightingsCount,
      icon: (color) => <Ionicons name="grid-outline" size={18} color={color} />,
    },
    {
      id: 'Logbook',
      label: t('profile.tabLogbook'),
      count: speciesCount,
      icon: (color) => <Ionicons name="book-outline" size={18} color={color} />,
    },
    {
      id: 'Likes',
      label: t('profile.tabLikes'),
      count: likesCount,
      icon: (color) => <Ionicons name="heart-outline" size={18} color={color} />,
    },
  ];

  return (
    <View
      style={[
        styles.tabsContainer,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border + '18',
          borderBottomColor: colors.border + '18',
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = isActive ? colors.primary : colors.textSecondary;

        return (
          <PressableScale
            key={tab.id}
            activeScale={0.98}
            haptic="light"
            onPress={() => onTabChange(tab.id)}
            style={[
              styles.tab,
              isActive && [
                styles.activeTab,
                { borderBottomColor: colors.primary },
              ],
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} (${tab.count})`}
          >
            <View style={styles.tabInner}>
              <View style={styles.iconBadgeRow}>
                {tab.icon(color)}
                {tab.count > 0 && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isActive
                          ? colors.primary + '20'
                          : colors.componentBase,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: isActive ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.tabLabel,
                  { color },
                  isActive && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 3,
  },
  activeTab: {
    // borderBottomColor set dynamically
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamilyBody,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabLabel: {
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
});
