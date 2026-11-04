import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BirdRepository } from '../repositories/bird.repository';
import { mapBird } from '../utils/mapBird';
import { RootStackParamList, BirdSpeciesData } from '../navigation/AppNavigator';
import { handleError } from '../utils/errorHandler';
import { TranslationKey } from '../i18n';

type DictionaryNavProp = NativeStackNavigationProp<RootStackParamList, 'Dictionary'>;

export type FilterId = 'all' | 'az' | 'resident' | 'migratory' | 'habitat' | 'family';

export interface FilterItem {
  id: FilterId;
  labelKey: TranslationKey;
  icon: string;
}

export const DICTIONARY_FILTERS: FilterItem[] = [
  { id: 'all', labelKey: 'dictionary.filterAll', icon: 'earth' },
  { id: 'az', labelKey: 'dictionary.filterAlphabetical', icon: 'text' },
  { id: 'resident', labelKey: 'dictionary.filterResidents', icon: 'home-outline' },
  { id: 'migratory', labelKey: 'dictionary.filterMigratory', icon: 'airplane-outline' },
  { id: 'habitat', labelKey: 'dictionary.filterHabitat', icon: 'leaf-outline' },
  { id: 'family', labelKey: 'dictionary.filterFamily', icon: 'git-network-outline' },
];

export function useDictionary() {
  const navigation = useNavigation<DictionaryNavProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [allBirds, setAllBirds] = useState<BirdSpeciesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const loadBirds = useCallback(async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const dbBirds = await BirdRepository.getAll();
      const mapped = dbBirds.map((bird, index) => mapBird(bird, index));
      setAllBirds(mapped);
    } catch (err) {
      handleError(err, setToast, 'Error al cargar el catálogo de aves');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBirds();
  }, [loadBirds]);

  const onRefresh = useCallback(() => {
    loadBirds(true);
  }, [loadBirds]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleFilterSelect = (filterId: FilterId) => {
    setActiveFilter(filterId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  // Filtrado y ordenamiento reactivo memoizado
  const filteredBirds = useMemo(() => {
    let result = [...allBirds];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.scientificName?.toLowerCase().includes(q) ||
          b.habitat?.toLowerCase().includes(q) ||
          b.classification?.family?.toLowerCase().includes(q)
      );
    }

    switch (activeFilter) {
      case 'resident':
        result = result.filter((b) => b.status === 'RESIDENTE');
        break;
      case 'migratory':
        result = result.filter((b) => b.status === 'MIGRATORIA');
        break;
      case 'az':
        result.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
        break;
      case 'habitat':
        result.sort((a, b) => (a.habitat || '').localeCompare(b.habitat || '', 'es'));
        break;
      case 'family':
        result.sort((a, b) =>
          (a.classification?.family || '').localeCompare(
            b.classification?.family || '',
            'es'
          )
        );
        break;
      case 'all':
      default:
        // Mantener orden natural o alfabetico
        break;
    }

    return result;
  }, [allBirds, searchQuery, activeFilter]);

  // Agrupamiento en secciones para SectionList
  const getSections = useCallback(() => {
    if (activeFilter === 'all' || activeFilter === 'resident' || activeFilter === 'migratory') {
      return [{ title: '', data: filteredBirds }];
    }

    const groups: Record<string, BirdSpeciesData[]> = {};

    filteredBirds.forEach((bird) => {
      let key = '';

      switch (activeFilter) {
        case 'az': {
          const firstChar = bird.name?.charAt(0)?.toUpperCase() || '#';
          key = /^[A-ZÁÉÍÓÚÑ]/.test(firstChar) ? firstChar : '#';
          break;
        }
        case 'habitat': {
          const firstHabitat = bird.habitat?.split(',')[0]?.trim();
          key = firstHabitat || 'General';
          break;
        }
        case 'family': {
          key = bird.classification?.family || 'Sin Familia';
          break;
        }
        default:
          key = '';
          break;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(bird);
    });

    return Object.keys(groups)
      .sort((a, b) => a.localeCompare(b, 'es'))
      .map((k) => ({
        title: k,
        data: groups[k],
      }));
  }, [activeFilter, filteredBirds]);

  const openBird = useCallback(
    (bird: BirdSpeciesData) => {
      navigation.navigate('BirdDetail', { bird });
    },
    [navigation]
  );

  return {
    // Estado
    searchQuery,
    activeFilter,
    allBirds,
    filteredBirds,
    loading,
    refreshing,
    viewMode,
    filters: DICTIONARY_FILTERS,
    toast,
    totalCount: allBirds.length,
    filteredCount: filteredBirds.length,

    // Acciones
    setSearchQuery,
    setToast,
    onRefresh,
    handleSearch,
    handleClearSearch,
    handleFilterSelect,
    handleResetFilters,
    toggleViewMode,
    getSections,
    openBird,
  };
}
