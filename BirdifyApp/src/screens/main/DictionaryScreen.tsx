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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import TopNavBar from '../../components/TopNavBar';
import { RootStackParamList, BirdSpeciesData } from '../../navigation/AppNavigator';

import { createStyles } from '../../styles/screens/main/dictionaryScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

import { BirdRepository } from '../../repositories/bird.repository';
import { mapBird } from '../../utils/mapBird';


type NavProp = NativeStackNavigationProp<RootStackParamList, 'Dictionary'>;

const FILTERS = ['All', 'A-Z', 'Season', 'Habitat', 'Family'];

export default function DictionaryScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Dictionary'>>();

  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('All');

  const [allBirds, setAllBirds] = React.useState<BirdSpeciesData[]>([]);
  const [filteredBirds, setFilteredBirds] = React.useState<BirdSpeciesData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingImages, setLoadingImages] = React.useState<Record<string, boolean>>({});

  const loadBirds = async () => {
    try {
      setLoading(true);

      const dbBirds = await BirdRepository.getAll();
      const mapped = dbBirds.map((bird, index) => mapBird(bird, index));

      setAllBirds(mapped);
      setFilteredBirds(mapped);

    } catch (err) {
      console.error('Error loading birds:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadBirds();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilterAndSearch(text, activeFilter, allBirds);
  };

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    applyFilterAndSearch(searchQuery, filter, allBirds);
  };

  const applyFilterAndSearch = (query: string, filter: string, source = allBirds) => {
    let result = [...source];

    if (query) {
      result = result.filter(b =>
        b.name?.toLowerCase().includes(query.toLowerCase()) ||
        b.scientificName?.toLowerCase().includes(query.toLowerCase())
      );
    }

    switch (filter) {
      case 'A-Z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Season':
        result.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case 'Habitat':
        result.sort((a, b) => a.habitat.localeCompare(b.habitat));
        break;
      case 'Family':
        result.sort((a, b) =>
          (a.classification?.family || '').localeCompare(
            b.classification?.family || ''
          )
        );
        break;
    }

    setFilteredBirds(result);
  };

  const getSections = () => {
    if (activeFilter === 'All') {
      return [{ title: '', data: filteredBirds }];
    }

    const groups: Record<string, BirdSpeciesData[]> = {};

    filteredBirds.forEach(bird => {
      let key = '';

      switch (activeFilter) {
        case 'A-Z':
          key = bird.name?.charAt(0)?.toUpperCase() || '#';
          break;
        case 'Season':
          key = bird.status || 'Unknown';
          break;
        case 'Habitat':
          key = bird.habitat?.split(',')[0] || 'Unknown';
          break;
        case 'Family':
          key = bird.classification?.family || 'Unknown';
          break;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(bird);
    });

    return Object.keys(groups).sort().map(k => ({
      title: k,
      data: groups[k],
    }));
  };

  const openBird = (bird: BirdSpeciesData) => {
    navigation.navigate('BirdDetail', { bird });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

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
            {FILTERS.map(f => (
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
                    onLoadStart={() =>
                      setLoadingImages(prev => ({
                        ...prev,
                        [String(item.id)]: true
                      }))
                    }
                    onLoadEnd={() =>
                      setLoadingImages(prev => ({
                        ...prev,
                        [String(item.id)]: false
                      }))
                    }
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