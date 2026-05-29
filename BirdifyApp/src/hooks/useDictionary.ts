import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BirdRepository } from '../repositories/bird.repository';
import { mapBird } from '../utils/mapBird';
import { RootStackParamList, BirdSpeciesData } from '../navigation/AppNavigator';

type DictionaryNavProp = NativeStackNavigationProp<RootStackParamList, 'Dictionary'>;

const FILTERS = ['All', 'A-Z', 'Season', 'Habitat', 'Family'];

export function useDictionary() {
  const navigation = useNavigation<DictionaryNavProp>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [allBirds, setAllBirds] = useState<BirdSpeciesData[]>([]);
  const [filteredBirds, setFilteredBirds] = useState<BirdSpeciesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
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

  const handleImageLoadStart = (birdId: string) => {
    setLoadingImages(prev => ({
      ...prev,
      [String(birdId)]: true
    }));
  };

  const handleImageLoadEnd = (birdId: string) => {
    setLoadingImages(prev => ({
      ...prev,
      [String(birdId)]: false
    }));
  };

  return {
    // State
    searchQuery,
    activeFilter,
    allBirds,
    filteredBirds,
    loading,
    loadingImages,
    filters: FILTERS,
    
    // Setters
    setSearchQuery,
    setActiveFilter,
    setLoadingImages,
    
    // Actions
    loadBirds,
    handleSearch,
    handleFilterSelect,
    applyFilterAndSearch,
    getSections,
    openBird,
    handleImageLoadStart,
    handleImageLoadEnd,
  };
}
