import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  SectionList,
  ActivityIndicator,
  TextInput,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import TopNavBar from '../../components/TopNavBar';
import { createStyles } from '../../styles/screens/main/dictionaryScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useDictionary } from '../../hooks/useDictionary';
import AppToast from '../../components/AppToast';

export default function DictionaryScreen() {
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const {
    searchQuery,
    activeFilter,
    filteredBirds,
    loading,
    loadingImages,
    filters,
    toast,
    setSearchQuery,
    setLoadingImages,
    setToast,
    handleSearch,
    handleFilterSelect,
    getSections,
    openBird,
    handleImageLoadStart,
    handleImageLoadEnd,
  } = useDictionary();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

      <TopNavBar />

      <View style={styles.container}>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search birds..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* FILTERS FIX */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {filters.map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => handleFilterSelect(f)}
                style={[
                  styles.filterChip,
                  activeFilter === f && styles.activeFilter,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === f && styles.activeFilterText,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LIST */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <SectionList
            style={styles.listContent}
            contentContainerStyle={{ paddingBottom: 120 }}
            sections={getSections()}
            keyExtractor={(item) => String(item.id ?? item.name)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.birdCard}
                onPress={() => openBird(item)}
              >
                <View style={styles.imageContainer}>
                  {loadingImages[String(item.id)] && (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                      style={styles.imageLoader}
                    />
                  )}
                  <Image
                    source={{ uri: item.image }}
                    style={styles.birdImage}
                    resizeMode="cover"
                    onLoadStart={() => handleImageLoadStart(String(item.id))}
                    onLoadEnd={() => handleImageLoadEnd(String(item.id))}
                  />
                </View>

                <View style={styles.birdInfo}>
                  <Text style={styles.birdName}>{item.name}</Text>
                  <Text style={styles.scientificName}>
                    {item.scientificName}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            renderSectionHeader={({ section }) =>
              section.title ? (
                <Text style={styles.sectionTitle}>
                  {section.title}
                </Text>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}