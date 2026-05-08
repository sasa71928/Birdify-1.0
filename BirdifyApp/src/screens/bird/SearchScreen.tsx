import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import styles from '../../styles/screens/bird/searchScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ── Datos de ejemplo ──────────────────────────────────────────────────────────
const RECENT_SEARCHES = ['Northern Cardinal', 'La Paz', 'Spring Migration'];

const POPULAR_TAGS = ['#Hummingbirds', '#Endemic', '#WinterVisitors', '#Wetlands'];

const CATEGORIES = [
  {
    id: '1',
    name: 'Songbirds',
    subtitle: '12 new entries',
    icon: 'leaf-outline' as const,
    iconColor: Colors.primary,
    bg: Colors.springMoss,
  },
  {
    id: '2',
    name: 'Raptors',
    subtitle: 'Trending now',
    icon: 'eye-outline' as const,
    iconColor: Colors.deepTerrain,
    bg: Colors.componentBase,
  },
];

// ── Componente principal ──────────────────────────────────────────────────────
export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

  const removeRecent = (item: string) =>
    setRecentSearches((prev) => prev.filter((s) => s !== item));

  const clearAll = () => setRecentSearches([]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* ── Barra de búsqueda ── */}
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search Observations"
            placeholderTextColor={Colors.placeholder}
            style={styles.input}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Búsquedas recientes ── */}
        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearAll}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {recentSearches.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.recentItem}
                onPress={() => setQuery(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={20} color={Colors.outlineGrey} style={{ marginRight: 12 }} />
                <Text style={styles.recentText}>{item}</Text>
                <TouchableOpacity onPress={() => removeRecent(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={18} color={Colors.outlineGrey} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Discover ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover</Text>

          {/* Tarjeta destacada */}
          <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=800' }}
              style={styles.featuredImage}
            />
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredLabel}>FEATURED GUIDE</Text>
              <Text style={styles.featuredTitle}>Nesting Season 2024</Text>
            </View>
          </TouchableOpacity>

          {/* Categorías */}
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} style={[styles.categoryCard, { backgroundColor: cat.bg }]} activeOpacity={0.85}>
                <View style={[styles.categoryIconCircle, { backgroundColor: cat.iconColor + '22' }]}>
                  <Ionicons name={cat.icon} size={22} color={cat.iconColor} />
                </View>
                <Text style={[styles.categoryName, { color: cat.iconColor }]}>{cat.name}</Text>
                <Text style={styles.categorySubtitle}>{cat.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Popular Tags ── */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Popular Tags</Text>
          <View style={styles.tagsWrap}>
            {POPULAR_TAGS.map((tag) => (
              <TouchableOpacity key={tag} style={styles.tag} onPress={() => setQuery(tag)} activeOpacity={0.75}>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

