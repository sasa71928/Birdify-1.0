import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  SectionList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import TopNavBar from '../../components/TopNavBar';
import { createStyles } from '../../styles/screens/main/dictionaryScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useDictionary } from '../../hooks/useDictionary';
import { useT } from '../../i18n';
import AppToast from '../../components/AppToast';
import { DictionarySkeleton } from '../../components/skeleton';
import { PressableScale } from '../../components/animated/PressableScale';
import { BirdGridCard } from '../../components/dictionary/BirdGridCard';
import { BirdListCard } from '../../components/dictionary/BirdListCard';
import { DictionaryEmptyState } from '../../components/dictionary/DictionaryEmptyState';
import { BirdSpeciesData } from '../../navigation/AppNavigator';

export default function DictionaryScreen() {
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { t } = useT();
  const {
    searchQuery,
    activeFilter,
    filteredBirds,
    loading,
    refreshing,
    viewMode,
    filters,
    toast,
    filteredCount,
    setToast,
    onRefresh,
    handleSearch,
    handleClearSearch,
    handleFilterSelect,
    handleResetFilters,
    toggleViewMode,
    getSections,
    openBird,
  } = useDictionary();

  // Adaptador de secciones para Cuadrícula (parejas) o Lista (elementos individuales)
  const sections = useMemo(() => {
    const rawSections = getSections();
    if (viewMode === 'list') {
      return rawSections.map((sec) => ({
        title: sec.title,
        data: sec.data as (BirdSpeciesData | [BirdSpeciesData, BirdSpeciesData?])[],
      }));
    }

    return rawSections.map((sec) => {
      const pairs: [BirdSpeciesData, BirdSpeciesData?][] = [];
      for (let i = 0; i < sec.data.length; i += 2) {
        pairs.push([sec.data[i], sec.data[i + 1]]);
      }
      return {
        title: sec.title,
        data: pairs as (BirdSpeciesData | [BirdSpeciesData, BirdSpeciesData?])[],
      };
    });
  }, [getSections, viewMode]);

  const keyExtractor = useCallback(
    (item: BirdSpeciesData | [BirdSpeciesData, BirdSpeciesData?], index: number) => {
      if (Array.isArray(item)) {
        const id1 = item[0]?.id ?? item[0]?.name ?? index;
        const id2 = item[1]?.id ?? item[1]?.name ?? 'none';
        return `grid-${id1}-${id2}-${index}`;
      }
      return `list-${item.id ?? item.name ?? index}`;
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: BirdSpeciesData | [BirdSpeciesData, BirdSpeciesData?] }) => {
      if (viewMode === 'grid') {
        const [bird1, bird2] = item as [BirdSpeciesData, BirdSpeciesData?];
        return (
          <View style={styles.gridRow}>
            <BirdGridCard
              bird={bird1}
              onPress={() => openBird(bird1)}
              styles={styles}
              colors={colors}
            />
            {bird2 ? (
              <BirdGridCard
                bird={bird2}
                onPress={() => openBird(bird2)}
                styles={styles}
                colors={colors}
              />
            ) : (
              <View style={{ width: styles.gridCard.width }} />
            )}
          </View>
        );
      }

      const bird = item as BirdSpeciesData;
      return (
        <BirdListCard
          bird={bird}
          onPress={() => openBird(bird)}
          styles={styles}
          colors={colors}
        />
      );
    },
    [viewMode, styles, colors, openBird]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: any[] } }) => {
      if (!section.title) return null;
      const count =
        viewMode === 'grid'
          ? section.data.reduce(
              (acc: number, pair: [BirdSpeciesData, BirdSpeciesData?]) =>
                acc + (pair[1] ? 2 : 1),
              0
            )
          : section.data.length;

      return (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionPill} />
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCountBadge}>
            <Text style={styles.sectionCountText}>{count}</Text>
          </View>
        </View>
      );
    },
    [styles, viewMode]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <TopNavBar />

      <View style={styles.container}>
        {/* FIELD GUIDE HEADER */}
        <View style={styles.fieldGuideHeader}>
          <View style={styles.headerTitlesWrap}>
            <Text style={styles.fieldGuideTitle}>
              {t('dictionary.fieldGuideTitle')}
            </Text>
            <View style={styles.countBadgeRow}>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {filteredCount} {t('dictionary.totalSpecies')}
                </Text>
              </View>
            </View>
          </View>

          <PressableScale
            activeScale={0.92}
            haptic="light"
            onPress={toggleViewMode}
            style={styles.viewToggleBtn}
            accessibilityRole="button"
            accessibilityLabel={
              viewMode === 'grid' ? t('dictionary.viewList') : t('dictionary.viewGrid')
            }
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={20}
              color={colors.primary}
            />
          </PressableScale>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('dictionary.searchBirds')}
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearSearchBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={t('dictionary.clearSearch')}
            >
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTERS */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {filters.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <PressableScale
                  key={f.id}
                  activeScale={0.96}
                  haptic="light"
                  onPress={() => handleFilterSelect(f.id)}
                  style={[
                    styles.filterChip,
                    isActive && styles.activeFilter,
                  ]}
                >
                  <Ionicons
                    name={f.icon as any}
                    size={13}
                    color={isActive ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.activeFilterText,
                    ]}
                  >
                    {t(f.labelKey)}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        {/* CONTENT */}
        {loading ? (
          <DictionarySkeleton />
        ) : filteredBirds.length === 0 ? (
          <DictionaryEmptyState
            searchQuery={searchQuery}
            onReset={handleResetFilters}
            styles={styles}
            colors={colors}
          />
        ) : (
          <SectionList
            contentContainerStyle={styles.listContent}
            sections={sections}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
