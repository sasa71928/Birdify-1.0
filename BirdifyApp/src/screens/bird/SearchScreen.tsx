import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, BirdSpeciesData } from '../../navigation/AppNavigator';

import { createStyles } from '../../styles/screens/bird/searchScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

import { BirdRepository } from '../../repositories/bird.repository';
import { mapBird } from '../../utils/mapBird';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const inputRef = useRef<TextInput>(null);

  const { screen: styles, colors, isDark } =
    useDynamicStyles(createStyles);

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [birds, setBirds] = useState<BirdSpeciesData[]>([]);
  const [results, setResults] = useState<BirdSpeciesData[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // ─────────────────────────────────────────────
  // LOAD DATA
  // ─────────────────────────────────────────────
  useEffect(() => {
    loadBirds();
  }, []);

  const loadBirds = async () => {
    try {
      const dbBirds = await BirdRepository.getAll();

      // ✔ MISMA FUENTE QUE DICTIONARY (SIN MOCKS)
      const mapped = dbBirds.map(mapBird);

      setBirds(mapped);
    } catch (error) {
      handleError(error, setToast, 'Error loading birds');
    }
  };

  // ─────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────
  const handleSearch = (text: string) => {
    setQuery(text);

    if (!text.trim()) {
      setResults([]);
      return;
    }

    const filtered = birds.filter(
      bird =>
        bird.name.toLowerCase().includes(text.toLowerCase()) ||
        bird.scientificName.toLowerCase().includes(text.toLowerCase())
    );

    setResults(filtered);
  };

  // ─────────────────────────────────────────────
  // OPEN BIRD
  // ─────────────────────────────────────────────
  const openBird = (bird: BirdSpeciesData) => {
    if (!recentSearches.includes(bird.name)) {
      setRecentSearches(prev => [bird.name, ...prev.slice(0, 4)]);
    }

    navigation.navigate('BirdDetail', { bird });
  };

  const removeRecent = (item: string) =>
    setRecentSearches(prev => prev.filter(s => s !== item));

  const clearAll = () => setRecentSearches([]);

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />

          <TextInput
            ref={inputRef}
            autoFocus
            value={query}
            onChangeText={handleSearch}
            placeholder="Search birds..."
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            returnKeyType="search"
          />

          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setResults([]);
              }}
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {query.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Search Results
            </Text>

            {results.length > 0 ? (
              results.map(bird => (
                <TouchableOpacity
                  key={bird.id}
                  style={styles.resultCard}
                  activeOpacity={0.8}
                  onPress={() => openBird(bird)}
                >
                  {/* ✔ IMAGEN 100% VIENE DE mapBird */}
                  <Image
                    source={{ uri: bird.image }}
                    style={styles.resultImage}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle}>
                      {bird.name}
                    </Text>

                    <Text style={styles.resultSubtitle}>
                      {bird.scientificName}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No birds found.
              </Text>
            )}
          </View>
        ) : (
          <>
            {/* RECENT SEARCHES */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Recent Searches
                  </Text>

                  <TouchableOpacity onPress={clearAll}>
                    <Text style={styles.clearAll}>
                      Clear All
                    </Text>
                  </TouchableOpacity>
                </View>

                {recentSearches.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={styles.recentItem}
                    onPress={() => handleSearch(item)}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={colors.textSecondary}
                      style={{ marginRight: 12 }}
                    />

                    <Text style={styles.recentText}>
                      {item}
                    </Text>

                    <TouchableOpacity onPress={() => removeRecent(item)}>
                      <Ionicons
                        name="close"
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}