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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import shared from '../styles/shared.styles';

interface BirdSpecies {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  status: 'RESIDENTE' | 'MIGRATORIA';
}

const MOCK_BIRDS: BirdSpecies[] = [
  {
    id: '1',
    name: 'Northern Cardinal',
    scientificName: 'Cardinalis cardinalis',
    image: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=400',
    status: 'RESIDENTE',
  },
  {
    id: '2',
    name: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    image: 'https://images.unsplash.com/photo-1520638029751-c947dd098db5?auto=format&fit=crop&q=80&w=400',
    status: 'RESIDENTE',
  },
  {
    id: '3',
    name: 'American Robin',
    scientificName: 'Turdus migratorius',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=400',
    status: 'MIGRATORIA',
  },
  {
    id: '4',
    name: 'Ruby-throated Hummingbird',
    scientificName: 'Archilochus colubris',
    image: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&q=80&w=400',
    status: 'MIGRATORIA',
  },
  {
    id: '5',
    name: 'Mourning Dove',
    scientificName: 'Zenaida macroura',
    image: 'https://images.unsplash.com/photo-1612170153139-6f881ff0675c?auto=format&fit=crop&q=80&w=400',
    status: 'RESIDENTE',
  },
  {
    id: '6',
    name: 'Bald Eagle',
    scientificName: 'Haliaeetus leucocephalus',
    image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=400',
    status: 'RESIDENTE',
  },
];

const FILTERS = ['All', 'A-Z', 'Season', 'Habitat', 'Region'];

export default function DictionaryScreen() {
  const renderBird = ({ item }: { item: BirdSpecies }) => (
    <TouchableOpacity style={styles.birdCard}>
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
          />
        </View>

        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {FILTERS.map((filter, index) => (
              <TouchableOpacity key={index} style={[styles.filterChip, index === 0 ? styles.activeFilter : null]}>
                <Text style={[styles.filterText, index === 0 ? styles.activeFilterText : null]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={MOCK_BIRDS}
          renderItem={renderBird}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F3',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  filtersWrapper: {
    marginBottom: Spacing.lg,
  },
  filtersScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: '#E8EDEB',
  },
  activeFilter: {
    backgroundColor: '#1B4D3E',
  },
  filterText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  activeFilterText: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  birdCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  imageContainer: {
    height: 160,
    width: '100%',
  },
  birdImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  birdInfo: {
    padding: Spacing.md,
  },
  birdName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
