import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import shared from '../../styles/shared/shared.styles';
import { RootStackParamList, BirdSpeciesData } from '../../navigation/AppNavigator';
import styles from '../../styles/screens/main/dictionaryScreen.styles';
import { useRoute, RouteProp } from '@react-navigation/native';

type DictionaryNavProp = NativeStackNavigationProp<RootStackParamList, 'Dictionary'>;

const MOCK_BIRDS: BirdSpeciesData[] = [
  {
    id: '1',
    name: 'Northern Cardinal',
    scientificName: 'Cardinalis cardinalis',
    image: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=600',
    status: 'RESIDENTE',
    overview: 'The Northern Cardinal is a fairly large, long-tailed songbird with a short, very thick bill and a prominent crest. The male is brilliant red all over, with a reddish bill and black face immediately around the bill. Females are pale brown overall with warm reddish tinges in the wings, tail, and crest.',
    habitat: 'Woodlands, gardens, shrublands, and wetlands across North America.',
    conservationStatus: 'Least Concern — Populations are widespread and stable.',
    classification: { kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Passeriformes', family: 'Cardinalidae', genus: 'Cardinalis' },
  },
  {
    id: '2',
    name: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    image: 'https://images.unsplash.com/photo-1520638029751-c947dd098db5?auto=format&fit=crop&q=80&w=600',
    status: 'RESIDENTE',
    overview: 'The Blue Jay is a noisy, bold, and aggressive bird. It is common at backyard feeders and in parks. Its vivid blue, white, and black plumage makes it unmistakable. Known for its intelligence and complex social behaviors.',
    habitat: 'Forests, woodlands, residential areas throughout eastern North America.',
    conservationStatus: 'Least Concern — Stable population trend.',
    classification: { kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Passeriformes', family: 'Corvidae', genus: 'Cyanocitta' },
  },
  {
    id: '3',
    name: 'American Robin',
    scientificName: 'Turdus migratorius',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=600',
    status: 'MIGRATORIA',
    overview: 'The American Robin is a migratory songbird of the true thrush genus. It is widely distributed throughout North America, wintering from southern Canada to central Mexico and along the Pacific Coast.',
    habitat: 'Woodlands, suburbs, parks, and open areas with earthworms.',
    conservationStatus: 'Least Concern — One of the most abundant birds in North America.',
    classification: { kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Passeriformes', family: 'Turdidae', genus: 'Turdus' },
  },
  {
    id: '4',
    name: 'Ruby-throated Hummingbird',
    scientificName: 'Archilochus colubris',
    image: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&q=80&w=600',
    status: 'MIGRATORIA',
    overview: 'The Ruby-throated Hummingbird is the smallest bird species that breeds in eastern North America. Males have a brilliant iridescent red throat. They beat their wings about 53 times a second in normal flight.',
    habitat: 'Deciduous and pine forests, orchards, gardens, and meadows.',
    conservationStatus: 'Least Concern — Population benefits from garden feeders.',
    classification: { kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Apodiformes', family: 'Trochilidae', genus: 'Archilochus' },
  },
  {
    id: '5',
    name: 'Mourning Dove',
    scientificName: 'Zenaida macroura',
    image: 'https://images.unsplash.com/photo-1612170153139-6f881ff0675c?auto=format&fit=crop&q=80&w=600',
    status: 'RESIDENTE',
    overview: 'The Mourning Dove is a medium-sized bird in the dove family Columbidae. Its cooing is a familiar sound throughout North America. A plump-bodied and long-tailed dove with soft gray-brown plumage.',
    habitat: 'Open areas including grasslands, agricultural fields, and suburban areas.',
    conservationStatus: 'Least Concern — One of the most hunted game birds in North America.',
    classification: { kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Columbiformes', family: 'Columbidae', genus: 'Zenaida' },
  },
  {
    id: '6',
    name: 'Bald Eagle',
    scientificName: 'Haliaeetus leucocephalus',
    image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=600',
    status: 'RESIDENTE',
    overview: 'The Bald Eagle is a bird of prey found in North America, serving as the national bird and symbol of the United States. Its range includes most of Canada and Alaska and all of the contiguous United States.',
    habitat: 'Near large open water bodies with abundant food supply and old-growth trees for nesting.',
    conservationStatus: 'Least Concern — Recovered from near-extinction thanks to conservation efforts.',
    classification: { kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Accipitriformes', family: 'Accipitridae', genus: 'Haliaeetus' },
  },
];

const FILTERS = ['All', 'A-Z', 'Season', 'Habitat', 'Family'];

export default function DictionaryScreen() {
  const navigation = useNavigation<DictionaryNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Dictionary'>>();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [filteredBirds, setFilteredBirds] = React.useState(MOCK_BIRDS);

  React.useEffect(() => {
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
      handleSearch(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilterAndSearch(text, activeFilter);
  };

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    applyFilterAndSearch(searchQuery, filter);
  };

  const applyFilterAndSearch = (query: string, filter: string) => {
    let result = [...MOCK_BIRDS];

    // Search query filter
    if (query) {
      result = result.filter(bird => 
        bird.name.toLowerCase().includes(query.toLowerCase()) ||
        bird.scientificName.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Category sorting/filtering
    switch (filter) {
      case 'A-Z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Season':
        // Sort by status (Resident vs Migratory)
        result.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case 'Habitat':
        // Sort by habitat description keyword
        result.sort((a, b) => a.habitat.localeCompare(b.habitat));
        break;
      case 'Family':
        // Sort by family classification
        result.sort((a, b) => {
          const familyA = a.classification?.family || '';
          const familyB = b.classification?.family || '';
          return familyA.localeCompare(familyB);
        });
        break;
      default:
        // 'All' or others - no additional sorting
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
          key = bird.name.charAt(0).toUpperCase();
          break;
        case 'Season':
          key = bird.status;
          break;
        case 'Habitat':
          // Extract first word of habitat as category
          key = bird.habitat.split(',')[0].split(' ')[0];
          break;
        case 'Family':
          key = bird.classification?.family || 'Unknown';
          break;
        default:
          key = 'Results';
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(bird);
    });

    return Object.keys(groups).sort().map(key => ({
      title: key,
      data: groups[key]
    }));
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => {
    if (!title) return null;
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );
  };

  const renderBird = ({ item }: { item: BirdSpeciesData }) => (
    <TouchableOpacity
      style={styles.birdCard}
      activeOpacity={0.88}
      onPress={() => navigation.navigate('BirdDetail', { bird: item })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.birdImage} />
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.birdInfo}>
        <Text style={styles.birdName}>{item.name}</Text>
        <Text style={styles.scientificName}>{item.scientificName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by common or scientific name..."
            placeholderTextColor={Colors.placeholder}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {FILTERS.map((filter, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.filterChip, 
                  activeFilter === filter ? styles.activeFilter : null
                ]}
                onPress={() => handleFilterSelect(filter)}
              >
                <Text style={[
                  styles.filterText, 
                  activeFilter === filter ? styles.activeFilterText : null
                ]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <SectionList
          sections={getSections()}
          renderItem={renderBird}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      </View>
    </SafeAreaView>
  );
}

