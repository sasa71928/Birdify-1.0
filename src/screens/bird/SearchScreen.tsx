import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList, BirdSpeciesData } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/bird/searchScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { BirdRepository } from '../../repositories/bird.repository';
import { ProfileRepository } from '../../repositories/profile.repository';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { useAuth } from '../../context/AuthContext';
import { mapBird } from '../../utils/mapBird';
import { handleError } from '../../utils/errorHandler';
import { useT } from '../../i18n';
import AppToast from '../../components/AppToast';
import { PressableScale } from '../../components/animated/PressableScale';
import { haptics } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RECENT_SEARCHES_KEY = '@birdify_recent_searches';

const POPULAR_SEARCH_TERMS = [
  'Colibrí',
  'Águila',
  'Carpintero',
  'Pelícano',
  'Garza',
  'Halcón',
  'Búho',
  'Cenzontle',
];

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const inputRef = useRef<any>(null);
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();
  const { t } = useT();

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [birds, setBirds] = useState<BirdSpeciesData[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'birds' | 'users'>('birds');
  const [birdStatusFilter, setBirdStatusFilter] = useState<'ALL' | 'RESIDENTE' | 'MIGRATORIA'>('ALL');

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Cargar historial de búsquedas de AsyncStorage
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed);
          }
        }
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    };
    loadRecentSearches();
  }, []);

  // Cargar aves y usuarios simultáneamente
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [dbBirds, dbUsers] = await Promise.all([
          BirdRepository.getAll(),
          ProfileRepository.getAll(),
        ]);
        if (!isMounted) return;
        setBirds(dbBirds.map(mapBird));
        setUsers(dbUsers);
      } catch (error) {
        if (!isMounted) return;
        handleError(error, setToast, 'Error loading search catalog');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Guardar término en historial persistente
  const saveRecent = useCallback(async (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== cleanTerm.toLowerCase()
      );
      const updated = [cleanTerm, ...filtered].slice(0, 8);
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const removeRecent = useCallback(async (term: string) => {
    haptics.light();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const clearAllRecents = useCallback(async () => {
    haptics.medium();
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY).catch(() => {});
  }, []);

  // Filtrado reactivo de aves (por nombre, científico, familia y hábitat)
  const filteredBirds = useMemo(() => {
    let list = birds;
    if (birdStatusFilter !== 'ALL') {
      list = list.filter((b) => b.status === birdStatusFilter);
    }
    if (!query.trim()) return list;

    const lower = query.toLowerCase().trim();
    return list.filter((bird) => {
      const nameMatch = bird.name.toLowerCase().includes(lower);
      const sciMatch = bird.scientificName.toLowerCase().includes(lower);
      const familyMatch = (bird.classification?.family || '')
        .toLowerCase()
        .includes(lower);
      const habitatMatch = (bird.habitat || '').toLowerCase().includes(lower);
      return nameMatch || sciMatch || familyMatch || habitatMatch;
    });
  }, [birds, birdStatusFilter, query]);

  // Filtrado reactivo de usuarios
  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const lower = query.toLowerCase().trim();
    return users.filter((u) => {
      const uName = (u.username || '').toLowerCase();
      const fName = (u.fullname || '').toLowerCase();
      const bio = (u.bio || '').toLowerCase();
      return uName.includes(lower) || fName.includes(lower) || bio.includes(lower);
    });
  }, [users, query]);

  // Navegación directa a ficha de especie
  const openBird = (bird: BirdSpeciesData) => {
    haptics.light();
    saveRecent(bird.name);
    navigation.navigate('BirdDetail', { bird });
  };

  // Función útil: Registrar avistamiento directo con especie precargada
  const handleQuickRecord = (bird: BirdSpeciesData) => {
    haptics.medium();
    saveRecent(bird.name);
    navigation.navigate('RecordSighting', { preselectedBird: bird });
  };

  // Navegación a perfil de usuario
  const openUser = (u: any) => {
    haptics.light();
    saveRecent(`@${u.username}`);
    navigation.navigate('Profile', { userId: u.id });
  };

  // Función útil: Iniciar chat directo con el usuario desde la búsqueda
  const handleStartConversation = async (targetUser: any) => {
    if (!user?.id || !targetUser?.id) return;
    if (user.id === targetUser.id) {
      navigation.navigate('Profile', { userId: 'me' });
      return;
    }
    haptics.light();
    try {
      const conversationId = await ConversationRepository.createDirectConversation(
        user.id,
        targetUser.id
      );
      navigation.navigate('Chat', { conversationId });
    } catch (error) {
      handleError(error, setToast, 'No se pudo iniciar la conversación');
    }
  };

  const selectTerm = (term: string) => {
    haptics.light();
    setQuery(term);
    saveRecent(term);
  };

  const isQueryActive = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* 1. Header de Búsqueda Mejorado */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBarRow}>
          <PressableScale
            activeScale={0.92}
            haptic="light"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </PressableScale>

          <View
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
            ]}
          >
            <Ionicons
              name="search-outline"
              size={19}
              color={isFocused ? colors.primary : colors.textSecondary}
              style={styles.searchIcon}
            />

            <TextInput
              ref={inputRef}
              autoFocus
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                activeTab === 'birds'
                  ? 'Buscar por nombre común, científico, hábitat...'
                  : 'Buscar usuarios por nombre o @usuario...'
              }
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              returnKeyType="search"
              clearButtonMode="never"
            />

            {isQueryActive && (
              <PressableScale
                activeScale={0.88}
                haptic="light"
                onPress={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                style={styles.clearBtn}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={colors.textSecondary}
                />
              </PressableScale>
            )}
          </View>
        </View>
      </View>

      {/* 2. Pestañas Segmentadas con Insignias de Conteo */}
      <View style={styles.tabsContainer}>
        <PressableScale
          activeScale={0.97}
          haptic="light"
          style={[styles.tab, activeTab === 'birds' && styles.activeTab]}
          onPress={() => {
            setActiveTab('birds');
            haptics.selection();
          }}
        >
          <MaterialCommunityIcons
            name="feather"
            size={16}
            color={activeTab === 'birds' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'birds' && styles.activeTabText,
            ]}
          >
            {t('bird.searchTabBirds')}
          </Text>
          {isQueryActive && (
            <View
              style={[
                styles.tabBadge,
                activeTab === 'birds' && styles.activeTabBadge,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === 'birds' && styles.activeTabBadgeText,
                ]}
              >
                {filteredBirds.length}
              </Text>
            </View>
          )}
        </PressableScale>

        <PressableScale
          activeScale={0.97}
          haptic="light"
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => {
            setActiveTab('users');
            haptics.selection();
          }}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={activeTab === 'users' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'users' && styles.activeTabText,
            ]}
          >
            {t('bird.searchTabUsers')}
          </Text>
          {isQueryActive && (
            <View
              style={[
                styles.tabBadge,
                activeTab === 'users' && styles.activeTabBadge,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === 'users' && styles.activeTabBadgeText,
                ]}
              >
                {filteredUsers.length}
              </Text>
            </View>
          )}
        </PressableScale>
      </View>

      {/* 3. Filtros Rápidos de Estado (solo en Aves) */}
      {activeTab === 'birds' && (
        <View style={styles.quickFiltersContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              birdStatusFilter === 'ALL' && styles.activeFilterChip,
            ]}
            onPress={() => {
              setBirdStatusFilter('ALL');
              haptics.selection();
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                birdStatusFilter === 'ALL' && styles.activeFilterChipText,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              birdStatusFilter === 'RESIDENTE' && styles.activeFilterChip,
            ]}
            onPress={() => {
              setBirdStatusFilter('RESIDENTE');
              haptics.selection();
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                birdStatusFilter === 'RESIDENTE' && styles.activeFilterChipText,
              ]}
            >
              Residentes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              birdStatusFilter === 'MIGRATORIA' && styles.activeFilterChip,
            ]}
            onPress={() => {
              setBirdStatusFilter('MIGRATORIA');
              haptics.selection();
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                birdStatusFilter === 'MIGRATORIA' && styles.activeFilterChipText,
              ]}
            >
              Migratorias
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. Contenido Principal */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          // Vista previa de esqueletos mientras carga catálogo inicial
          <View style={styles.section}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonImage} />
                <View style={{ flex: 1 }}>
                  <View style={styles.skeletonTextLarge} />
                  <View style={styles.skeletonTextSmall} />
                </View>
              </View>
            ))}
          </View>
        ) : isQueryActive ? (
          // Vista de Resultados Filtrados
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name={activeTab === 'birds' ? 'sparkles-outline' : 'people-outline'}
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.sectionTitle}>
                  {activeTab === 'birds'
                    ? `Aves encontradas (${filteredBirds.length})`
                    : `Observadores encontrados (${filteredUsers.length})`}
                </Text>
              </View>
            </View>

            {activeTab === 'birds' ? (
              filteredBirds.length > 0 ? (
                filteredBirds.map((bird) => (
                  <View key={bird.id} style={styles.resultCard}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => openBird(bird)}
                    >
                      <ExpoImage
                        source={{ uri: bird.image }}
                        style={styles.birdImage}
                        contentFit="cover"
                        transition={150}
                      />
                    </TouchableOpacity>

                    <View style={styles.cardContent}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => openBird(bird)}
                      >
                        <Text style={styles.resultTitle} numberOfLines={1}>
                          {bird.name}
                        </Text>
                        <Text style={styles.resultSubtitle} numberOfLines={1}>
                          {bird.scientificName}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.badgesRow}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                bird.status === 'MIGRATORIA'
                                  ? '#d9770618'
                                  : '#16a34a18',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color:
                                  bird.status === 'MIGRATORIA'
                                    ? '#d97706'
                                    : '#16a34a',
                              },
                            ]}
                          >
                            {bird.status === 'MIGRATORIA'
                              ? t('bird.statusMigratory')
                              : t('bird.statusResident')}
                          </Text>
                        </View>

                        {bird.habitat && (
                          <View style={styles.habitatBadge}>
                            <Text
                              style={styles.habitatBadgeText}
                              numberOfLines={1}
                            >
                              {bird.habitat}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Botones de acción útiles */}
                      <View style={styles.cardActionsRow}>
                        <TouchableOpacity
                          style={[
                            styles.cardActionButton,
                            styles.cardActionPrimaryButton,
                          ]}
                          onPress={() => handleQuickRecord(bird)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="camera" size={13} color="#FFFFFF" />
                          <Text
                            style={[
                              styles.cardActionButtonText,
                              styles.cardActionPrimaryText,
                            ]}
                          >
                            Registrar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cardActionButton}
                          onPress={() => openBird(bird)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="book-outline"
                            size={13}
                            color={colors.textSecondary}
                          />
                          <Text style={styles.cardActionButtonText}>Ficha</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <MaterialCommunityIcons
                      name="bird"
                      size={36}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>
                    No encontramos aves para "{query}"
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Verifica la ortografía, intenta buscar por nombre científico,
                    hábitat o cambia los filtros de migración.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyResetBtn}
                    onPress={() => {
                      setQuery('');
                      setBirdStatusFilter('ALL');
                    }}
                  >
                    <Ionicons name="refresh" size={14} color="#FFFFFF" />
                    <Text style={styles.emptyResetBtnText}>
                      Limpiar búsqueda
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <View key={u.id} style={styles.resultCard}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => openUser(u)}
                  >
                    <ExpoImage
                      source={{
                        uri:
                          u.profile_pic_url ||
                          'https://gravatar.com/avatar/?d=mp',
                      }}
                      style={styles.userAvatar}
                      contentFit="cover"
                      transition={150}
                    />
                  </TouchableOpacity>

                  <View style={styles.cardContent}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => openUser(u)}
                    >
                      <View style={styles.nameRow}>
                        <Text style={styles.resultTitle} numberOfLines={1}>
                          {u.fullname || u.username}
                        </Text>
                        {u.is_verified && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={colors.primary}
                          />
                        )}
                      </View>
                      <Text style={styles.userHandle}>@{u.username}</Text>
                    </TouchableOpacity>

                    {u.bio && (
                      <Text style={styles.userBio} numberOfLines={1}>
                        {u.bio}
                      </Text>
                    )}

                    {/* Botones de acción útiles */}
                    <View style={styles.cardActionsRow}>
                      {user?.id !== u.id && (
                        <TouchableOpacity
                          style={[
                            styles.cardActionButton,
                            styles.cardActionPrimaryButton,
                          ]}
                          onPress={() => handleStartConversation(u)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="chatbubble-ellipses"
                            size={13}
                            color="#FFFFFF"
                          />
                          <Text
                            style={[
                              styles.cardActionButtonText,
                              styles.cardActionPrimaryText,
                            ]}
                          >
                            Mensaje
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => openUser(u)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="person-outline"
                          size={13}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.cardActionButtonText}>Perfil</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="people-outline"
                    size={36}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  No encontramos usuarios para "{query}"
                </Text>
                <Text style={styles.emptySubtitle}>
                  Intenta buscar por su nombre completo o por su @nombredeusuario.
                </Text>
                <TouchableOpacity
                  style={styles.emptyResetBtn}
                  onPress={() => setQuery('')}
                >
                  <Ionicons name="refresh" size={14} color="#FFFFFF" />
                  <Text style={styles.emptyResetBtnText}>
                    Limpiar búsqueda
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          // Vista Inicial: Búsquedas Recientes, Exploración Rápida y Sugerencias
          <>
            {/* Historial Reciente Persistente */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.sectionTitle}>
                      {t('bird.recentSearches')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.clearAllBtn}
                    onPress={clearAllRecents}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={13}
                      color={colors.primary}
                    />
                    <Text style={styles.clearAllText}>
                      {t('bird.clearHistory')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentList}>
                  {recentSearches.map((term) => (
                    <PressableScale
                      key={term}
                      activeScale={0.98}
                      haptic="light"
                      style={styles.recentItem}
                      onPress={() => selectTerm(term)}
                    >
                      <Ionicons
                        name="time-outline"
                        size={17}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.recentText}>{term}</Text>
                      <TouchableOpacity
                        style={styles.removeRecentBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => removeRecent(term)}
                      >
                        <Ionicons
                          name="close"
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </PressableScale>
                  ))}
                </View>
              </View>
            )}

            {/* Exploración Rápida / Especies Populares */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons
                    name="compass-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Exploración Rápida</Text>
                </View>
              </View>

              <View style={styles.trendingWrap}>
                {POPULAR_SEARCH_TERMS.map((term) => (
                  <PressableScale
                    key={term}
                    activeScale={0.95}
                    haptic="light"
                    style={styles.trendingChip}
                    onPress={() => selectTerm(term)}
                  >
                    <Ionicons
                      name="leaf-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.trendingChipText}>{term}</Text>
                  </PressableScale>
                ))}
              </View>
            </View>

            {/* Sugerencias Destacadas con Acciones */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons
                    name={
                      activeTab === 'birds'
                        ? 'sparkles-outline'
                        : 'people-outline'
                    }
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>
                    {activeTab === 'birds'
                      ? 'Especies Recomendadas'
                      : 'Observadores de la Comunidad'}
                  </Text>
                </View>
              </View>

              {activeTab === 'birds'
                ? birds.slice(0, 8).map((bird) => (
                    <View key={bird.id} style={styles.resultCard}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => openBird(bird)}
                      >
                        <ExpoImage
                          source={{ uri: bird.image }}
                          style={styles.birdImage}
                          contentFit="cover"
                          transition={150}
                        />
                      </TouchableOpacity>

                      <View style={styles.cardContent}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => openBird(bird)}
                        >
                          <Text style={styles.resultTitle} numberOfLines={1}>
                            {bird.name}
                          </Text>
                          <Text style={styles.resultSubtitle} numberOfLines={1}>
                            {bird.scientificName}
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.badgesRow}>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  bird.status === 'MIGRATORIA'
                                    ? '#d9770618'
                                    : '#16a34a18',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                {
                                  color:
                                    bird.status === 'MIGRATORIA'
                                      ? '#d97706'
                                      : '#16a34a',
                                },
                              ]}
                            >
                              {bird.status === 'MIGRATORIA'
                                ? t('bird.statusMigratory')
                                : t('bird.statusResident')}
                            </Text>
                          </View>
                          {bird.habitat && (
                            <View style={styles.habitatBadge}>
                              <Text
                                style={styles.habitatBadgeText}
                                numberOfLines={1}
                              >
                                {bird.habitat}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Botones de acción útiles */}
                        <View style={styles.cardActionsRow}>
                          <TouchableOpacity
                            style={[
                              styles.cardActionButton,
                              styles.cardActionPrimaryButton,
                            ]}
                            onPress={() => handleQuickRecord(bird)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="camera" size={13} color="#FFFFFF" />
                            <Text
                              style={[
                                styles.cardActionButtonText,
                                styles.cardActionPrimaryText,
                              ]}
                            >
                              Registrar
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.cardActionButton}
                            onPress={() => openBird(bird)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name="book-outline"
                              size={13}
                              color={colors.textSecondary}
                            />
                            <Text style={styles.cardActionButtonText}>
                              Ficha
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                : users.slice(0, 8).map((u) => (
                    <View key={u.id} style={styles.resultCard}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => openUser(u)}
                      >
                        <ExpoImage
                          source={{
                            uri:
                              u.profile_pic_url ||
                              'https://gravatar.com/avatar/?d=mp',
                          }}
                          style={styles.userAvatar}
                          contentFit="cover"
                          transition={150}
                        />
                      </TouchableOpacity>

                      <View style={styles.cardContent}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => openUser(u)}
                        >
                          <View style={styles.nameRow}>
                            <Text style={styles.resultTitle} numberOfLines={1}>
                              {u.fullname || u.username}
                            </Text>
                            {u.is_verified && (
                              <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color={colors.primary}
                              />
                            )}
                          </View>
                          <Text style={styles.userHandle}>@{u.username}</Text>
                        </TouchableOpacity>

                        {u.bio && (
                          <Text style={styles.userBio} numberOfLines={1}>
                            {u.bio}
                          </Text>
                        )}

                        {/* Botones de acción útiles */}
                        <View style={styles.cardActionsRow}>
                          {user?.id !== u.id && (
                            <TouchableOpacity
                              style={[
                                styles.cardActionButton,
                                styles.cardActionPrimaryButton,
                              ]}
                              onPress={() => handleStartConversation(u)}
                              activeOpacity={0.8}
                            >
                              <Ionicons
                                name="chatbubble-ellipses"
                                size={13}
                                color="#FFFFFF"
                              />
                              <Text
                                style={[
                                  styles.cardActionButtonText,
                                  styles.cardActionPrimaryText,
                                ]}
                              >
                                Mensaje
                              </Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            style={styles.cardActionButton}
                            onPress={() => openUser(u)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name="person-outline"
                              size={13}
                              color={colors.textSecondary}
                            />
                            <Text style={styles.cardActionButtonText}>
                              Perfil
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
