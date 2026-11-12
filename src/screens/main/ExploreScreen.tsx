import React, { useMemo, useCallback, useContext, useState } from 'react';
import { OfflineContext } from '../../navigation/AppNavigator';
import {
  View,
  Text,
  TextInput,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import MapView, { Marker } from 'react-native-maps';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

import { createStyles } from '../../styles/screens/main/exploreScreen.styles';

import { useDynamicStyles } from '../../hooks/useDynamicStyles';

import { useExplore } from '../../hooks/useExplore';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n';
import { mapBird } from '../../utils/mapBird';
import AppToast from '../../components/AppToast';
import { ExploreSkeleton } from '../../components/skeleton';
import { PressableScale } from '../../components/animated/PressableScale';
import { SightingMapCard } from '../../components/explore/SightingMapCard';
import FeedItem from '../../components/FeedItem';
import { mapSightingToPost } from '../../features/profile/utils/mapSightingToPost';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Explore'>;

const createMapStyle = (colors: any) => [
  {
    elementType: 'geometry',
    stylers: [{ color: colors.surfaceDim }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: colors.textPrimary }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: colors.surface }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: colors.componentBase }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: colors.canvasPure }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: colors.deepTerrain }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: colors.surfaceDim }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: colors.surface }],
  },
];

export default function ExploreScreen() {
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { t } = useT();
  const isOffline = useContext(OfflineContext);
  const navigation = useNavigation<NavProp>();
  const isFocused = useIsFocused();

  const MAP_STYLE = useMemo(() => createMapStyle(colors), [colors]);

  const {
    loading,
    selectedMarker,
    sightings,
    setSightings,
    searchQuery,
    filteredSightings,
    userLocation,
    selectedSighting,
    DEFAULT_REGION,
    mapRef,
    toast,
    setSearchQuery,
    setSelectedMarker,
    setToast,
    closeSelection,
    handleSearch,
    handleMarkerPress,
    getTimeAgo,
    calculateDistance,
    loadSightings,
  } = useExplore();
  const { user } = useAuth();

  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPostSighting, setSelectedPostSighting] = useState<any>(null);

  const selectedSightingDistance = useMemo(() => {
    if (!selectedSighting || !userLocation) return null;
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      Number(selectedSighting.latitude),
      Number(selectedSighting.longitude)
    );
  }, [selectedSighting, userLocation, calculateDistance]);

  const handleViewDetails = useCallback(() => {
    if (!selectedSighting) return;
    const birdData = selectedSighting.bird || {
      id: selectedSighting.id,
      common_name: 'Ave observada',
      scientific_name: 'Especie silvestre',
      image_url: selectedSighting.photo_url || selectedSighting.local_photo_path,
    };
    const mappedBird = mapBird(birdData, 0);
    navigation.navigate('BirdDetail', { bird: mappedBird });
  }, [selectedSighting, navigation]);

  const handleViewPost = useCallback(() => {
    if (!selectedSighting) return;
    setSelectedPostSighting(selectedSighting);
    setShowPostModal(true);
  }, [selectedSighting]);

  const handleLikeToggled = useCallback(
    (postId: string, hasLiked: boolean, newCount: number) => {
      if (!user?.id) return;
      setSightings((prev) =>
        prev.map((s) => {
          if (s.id !== postId) return s;
          const currentReactions = (s as any).reactions || [];
          const updatedReactions = hasLiked
            ? currentReactions.some((r: any) => r.user_id === user.id)
              ? currentReactions
              : [...currentReactions, { user_id: user.id }]
            : currentReactions.filter((r: any) => r.user_id !== user.id);
          return {
            ...s,
            has_liked: hasLiked,
            likes_count: newCount,
            reactions: updatedReactions,
          };
        })
      );
      setSelectedPostSighting((prev: any) => {
        if (!prev || prev.id !== postId) return prev;
        const currentReactions = prev.reactions || [];
        const updatedReactions = hasLiked
          ? currentReactions.some((r: any) => r.user_id === user.id)
            ? currentReactions
            : [...currentReactions, { user_id: user.id }]
          : currentReactions.filter((r: any) => r.user_id !== user.id);
        return {
          ...prev,
          has_liked: hasLiked,
          likes_count: newCount,
          reactions: updatedReactions,
        };
      });
    },
    [user?.id, setSightings]
  );

  const handleCommentAdded = useCallback(
    (postId: string, newCount: number) => {
      setSightings((prev) =>
        prev.map((s) => {
          if (s.id !== postId) return s;
          const currentComments = (s as any).comments || [];
          return {
            ...s,
            comments_count: newCount,
            comments: [...currentComments, { id: Date.now().toString() }],
          };
        })
      );
      setSelectedPostSighting((prev: any) => {
        if (!prev || prev.id !== postId) return prev;
        const currentComments = prev.comments || [];
        return {
          ...prev,
          comments_count: newCount,
          comments: [...currentComments, { id: Date.now().toString() }],
        };
      });
    },
    [setSightings]
  );

  const markers = useMemo(
    () =>
      filteredSightings.map((item) => {
        const isSelected = selectedMarker === item.id;
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <Marker
            key={item.id}
            coordinate={{
              latitude: lat,
              longitude: lng,
            }}
            zIndex={isSelected ? 999 : 1}
            onPress={(e) => {
              e?.stopPropagation?.();
              handleMarkerPress(item.id);
              mapRef.current?.animateToRegion(
                {
                  latitude: lat,
                  longitude: lng,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                },
                300
              );
            }}
          >
            <Ionicons
              name="location"
              size={isSelected ? 40 : 28}
              color={isSelected ? colors.secondaryBlue : colors.primary}
            />
          </Marker>
        );
      }),
    [
      filteredSightings,
      selectedMarker,
      colors.primary,
      colors.secondaryBlue,
      handleMarkerPress,
    ]
  );

  if (isOffline) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.surface,
          },
        ]}
      >
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Ionicons
          name="cloud-offline-outline"
          size={48}
          color={colors.textSecondary}
        />
        <Text
          style={{
            color: colors.textSecondary,
            marginTop: 12,
            fontSize: 16,
          }}
        >
          No disponible sin conexión
        </Text>
      </View>
    );
  }

  if (!isFocused) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]} />
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ExploreSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {isFocused && (
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation
          showsCompass={false}
          showsMyLocationButton={false}
          moveOnMarkerPress={false}
          toolbarEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          customMapStyle={isDark ? MAP_STYLE : []}
          initialRegion={DEFAULT_REGION}
          onPress={(e) => {
            if (e?.nativeEvent?.action === 'marker-press') return;
            closeSelection();
          }}
        >
          {markers}
        </MapView>
      )}

      {selectedSighting && (
        <SightingMapCard
          sighting={selectedSighting}
          distance={selectedSightingDistance}
          timeAgo={getTimeAgo(selectedSighting.created_at)}
          onClose={closeSelection}
          onViewDetails={handleViewDetails}
          onViewPost={handleViewPost}
          onUserPress={(userId) => navigation.navigate('Profile', { userId })}
          colors={colors}
        />
      )}

      {/* Sighting Post Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPostModal}
        onRequestClose={() => setShowPostModal(false)}
        statusBarTranslucent
      >
        <View style={styles.postModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowPostModal(false)}
          />

          <ScrollView
            contentContainerStyle={styles.postModalScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.postCardWrap}>
              {selectedPostSighting && (
                <FeedItem
                  post={mapSightingToPost(selectedPostSighting, user?.id)}
                  onPostDeleted={() => {
                    setShowPostModal(false);
                    loadSightings();
                  }}
                  onNavigateAway={() => setShowPostModal(false)}
                  onLikeToggled={handleLikeToggled}
                  onCommentAdded={handleCommentAdded}
                />
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.closePostModalBtn}
            onPress={() => setShowPostModal(false)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder={t('explore.searchBird')}
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </SafeAreaView>

      {searchQuery.length > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 110,
            left: 16,
            right: 16,
            maxHeight: 320,
            backgroundColor: colors.surface,
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <FlatList
            data={filteredSightings}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const distance = userLocation
                ? calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    Number(item.latitude),
                    Number(item.longitude)
                  )
                : null;

              return (
                <PressableScale
                  activeScale={0.98}
                  haptic="light"
                  onPress={() => {
                    setSelectedMarker(item.id);
                    setSearchQuery('');
                    mapRef.current?.animateToRegion({
                      latitude: Number(item.latitude),
                      longitude: Number(item.longitude),
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    });
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 15,
                      fontWeight: '600',
                    }}
                  >
                    {item.bird?.common_name ?? 'Bird'}
                  </Text>

                  <Text
                    style={{
                      color: colors.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    Lat: {Number(item.latitude).toFixed(4)}
                  </Text>

                  <Text
                    style={{
                      color: colors.textSecondary,
                    }}
                  >
                    Lng: {Number(item.longitude).toFixed(4)}
                  </Text>

                  {distance && (
                    <Text
                      style={{
                        color: colors.primary,
                        marginTop: 6,
                        fontWeight: '600',
                      }}
                    >
                      {distance} km away
                    </Text>
                  )}
                </PressableScale>
              );
            }}
          />
        </View>
      )}

      <PressableScale
        activeScale={0.98}
        haptic="light"
        style={styles.locationButton}
        onPress={() => {
          if (!userLocation) return;

          mapRef.current?.animateToRegion({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
          setSelectedMarker(null);
        }}
      >
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={24}
          color={colors.textPrimary}
        />
      </PressableScale>
    </View>
  );
}
