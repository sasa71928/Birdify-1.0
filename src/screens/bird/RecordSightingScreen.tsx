import React, { useRef, useMemo, useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { OfflineContext } from '../../context/OfflineContext';
import { createStyles } from '../../styles/screens/bird/recordSightingScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useRecordSighting } from '../../hooks/useRecordSighting';
import { useT } from '../../i18n';
import AppToast from '../../components/AppToast';
import { PressableScale, AnimatedSwitch } from '../../components/animated';
import { createMapStyle } from '../../components/sighting/mapStyle';
import { PhotoSourceModal } from '../../components/sighting/PhotoSourceModal';
import { haptics } from '../../utils/haptics';

const OBSERVATION_TAGS = [
  'En vuelo',
  'Cantando',
  'Alimentándose',
  'En nido',
  'Juvenil',
  'Adulto',
  'Pareja',
];

export default function RecordSightingScreen({ route }: { route: any }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const isOffline = useContext(OfflineContext);
  const { t } = useT();

  const MAP_STYLE = useMemo(() => createMapStyle(colors), [colors]);

  const editingSightingId = route?.params?.editingSighting;
  const preselectedBird = route?.params?.preselectedBird;
  const screenHeight = Dimensions.get('window').height;

  const [showManualCoords, setShowManualCoords] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const {
    birdName,
    notes,
    selectedBird,
    showDropdown,
    imageUris,
    isPrivate,
    isPosting,
    toast,
    region,
    isLocating,
    modalVisible,
    isEditMode,
    isLocked,
    canEdit,
    filteredBirds,
    mapRef,
    panY,
    backdropOpacity,
    panResponder,
    setBirdName,
    setNotes,
    setSelectedBird,
    setShowDropdown,
    setIsPrivate,
    setModalVisible,
    setToast,
    setRegion,
    handlePickImage,
    handleUseCurrentLocation,
    handlePost,
    handleRemoveImage,
    handleBirdSelect,
    handleClearBird,
    handleRegionChange,
  } = useRecordSighting(editingSightingId, preselectedBird);

  const handleAddTag = (tag: string) => {
    haptics.selection();
    setNotes((prev) => {
      if (!prev || prev.trim() === '') return tag;
      if (prev.includes(tag)) return prev;
      return `${prev}, ${tag}`;
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* 1. Header de Navegación Dedicado */}
      <View style={styles.header}>
        <PressableScale
          activeScale={0.92}
          haptic="light"
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </PressableScale>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {isEditMode ? t('sighting.editTitle') : t('sighting.recordTitle')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isOffline ? 'Modo sin conexión' : 'Observación de campo'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom:
                keyboardHeight > 0
                  ? keyboardHeight + (Platform.OS === 'ios' ? 40 : 80)
                  : 120,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {isLocked && (
            <View style={styles.bannerNotice}>
              <Ionicons name="time-outline" size={18} color="#92400E" />
              <Text style={styles.bannerNoticeText}>
                {t('sighting.lockedNotice')}
              </Text>
            </View>
          )}

          {/* 2. Sección de Fotografías (Hero Dropzone o Galería Activa) */}
          {imageUris.length === 0 ? (
            <View style={styles.photoHeroEmpty}>
              <View style={styles.cameraIconCircle}>
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.photoHeroTitle}>
                {t('sighting.tapToAddPhoto')}
              </Text>
              <Text style={styles.photoHeroSubtitle}>
                {t('sighting.addUpTo10')}
              </Text>

              <View style={styles.photoActionButtonsRow}>
                <PressableScale
                  activeScale={0.94}
                  haptic="light"
                  style={[styles.photoActionBtn, styles.photoActionBtnPrimary]}
                  onPress={() => {
                    if (!isLocked) handlePickImage('camera');
                  }}
                  disabled={isLocked}
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                  <Text
                    style={[
                      styles.photoActionBtnText,
                      styles.photoActionBtnPrimaryText,
                    ]}
                  >
                    Tomar foto
                  </Text>
                </PressableScale>

                <PressableScale
                  activeScale={0.94}
                  haptic="light"
                  style={styles.photoActionBtn}
                  onPress={() => {
                    if (!isLocked) handlePickImage('gallery');
                  }}
                  disabled={isLocked}
                >
                  <Ionicons
                    name="images-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.photoActionBtnText}>Galería</Text>
                </PressableScale>
              </View>
            </View>
          ) : (
            <View style={styles.galleryContainer}>
              <View style={styles.galleryHeader}>
                <Text style={styles.galleryTitle}>Fotografías del avistamiento</Text>
                <View style={styles.galleryCountPill}>
                  <Text style={styles.galleryCountText}>
                    {imageUris.length}/10 fotos
                  </Text>
                </View>
              </View>

              {/* Foto Principal Destacada */}
              <View style={styles.thumbnailHeroWrap}>
                <ExpoImage
                  source={{ uri: imageUris[0] }}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                  transition={150}
                />
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>Foto principal (1)</Text>
                </View>
                {!isLocked && (
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => handleRemoveImage(0)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Cuadrícula de fotos secundarias */}
              <View style={styles.thumbnailGrid}>
                {imageUris.slice(1).map((uri, index) => {
                  const actualIndex = index + 1;
                  return (
                    <View key={actualIndex} style={styles.thumbnailWrap}>
                      <ExpoImage
                        source={{ uri }}
                        style={styles.thumbnailImage}
                        contentFit="cover"
                        transition={150}
                      />
                      {!isLocked && (
                        <TouchableOpacity
                          style={styles.removePhotoBtn}
                          onPress={() => handleRemoveImage(actualIndex)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="close" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}

                {imageUris.length < 10 && !isLocked && (
                  <PressableScale
                    activeScale={0.94}
                    haptic="light"
                    style={styles.addMoreCard}
                    onPress={() => setModalVisible(true)}
                  >
                    <Ionicons name="add" size={24} color={colors.primary} />
                    <Text style={styles.addMoreText}>Añadir más</Text>
                  </PressableScale>
                )}
              </View>
            </View>
          )}

          {/* 3. Selección y Ficha de Especie */}
          <View style={[styles.cardSection, { zIndex: 10 }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons
                  name="feather"
                  size={17}
                  color={colors.primary}
                />
                <Text style={styles.sectionTitle}>
                  {t('sighting.whichBirdPrompt')}
                </Text>
              </View>
            </View>

            {selectedBird ? (
              // Tarjeta de Especie Seleccionada
              <View style={styles.selectedBirdCard}>
                <View style={styles.selectedBirdIconWrap}>
                  <MaterialCommunityIcons
                    name="bird"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.selectedBirdContent}>
                  <Text style={styles.selectedBirdName} numberOfLines={1}>
                    {selectedBird.common_name}
                  </Text>
                  <Text style={styles.selectedBirdSci} numberOfLines={1}>
                    {selectedBird.scientific_name}
                  </Text>
                </View>
                {!isLocked && (
                  <TouchableOpacity
                    style={styles.changeBirdBtn}
                    onPress={handleClearBird}
                  >
                    <Text style={styles.changeBirdBtnText}>Cambiar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              // Buscador Autocomplete de Especie
              <View style={{ position: 'relative' }}>
                <View
                  style={[
                    styles.searchWrapper,
                    isSearchFocused && styles.searchWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={19}
                    color={
                      isSearchFocused ? colors.primary : colors.textSecondary
                    }
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={t('sighting.searchSpeciesPlaceholder')}
                    placeholderTextColor={colors.placeholder}
                    value={birdName}
                    onFocus={() => {
                      if (!canEdit) return;
                      setIsSearchFocused(true);
                      if (birdName.length > 0) setShowDropdown(true);
                      setTimeout(() => {
                        scrollRef.current?.scrollTo({ y: 180, animated: true });
                      }, 120);
                    }}
                    onBlur={() => setIsSearchFocused(false)}
                    onChangeText={(text) => {
                      if (!canEdit) return;
                      setBirdName(text);
                      setSelectedBird(null);
                      setShowDropdown(text.length > 0);
                    }}
                    editable={!isLocked}
                  />
                  {birdName.length > 0 && !isLocked && (
                    <TouchableOpacity onPress={handleClearBird}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Dropdown de Coincidencias */}
                {showDropdown && (
                  <View style={styles.dropdownCard}>
                    <ScrollView
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      style={{ maxHeight: 240 }}
                    >
                      {filteredBirds.map((bird) => (
                        <TouchableOpacity
                          key={bird.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            haptics.selection();
                            Keyboard.dismiss();
                            handleBirdSelect(bird);
                          }}
                        >
                          <MaterialCommunityIcons
                            name="bird"
                            size={18}
                            color={colors.primary}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dropdownItemText}>
                              {bird.common_name}
                            </Text>
                            <Text style={styles.dropdownItemSci}>
                              {bird.scientific_name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}

                      {filteredBirds.length === 0 && (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedBird({
                              id: 'unidentified_bird',
                              common_name: birdName,
                              scientific_name: 'Especie silvestre',
                            });
                            setShowDropdown(false);
                          }}
                        >
                          <Ionicons
                            name="add-circle-outline"
                            size={18}
                            color={colors.primary}
                          />
                          <Text
                            style={{
                              fontSize: 13.5,
                              color: colors.primary,
                              fontFamily: 'PlusJakartaSans-SemiBold',
                            }}
                          >
                            {t('sighting.createAsNewSpecies', {
                              name: birdName,
                            })}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* 4. Notas de Campo y Etiquetas de Comportamiento */}
          <View style={[styles.cardSection, { zIndex: 1 }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.sectionTitle}>
                  {t('sighting.descriptionLabel')}
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder={t('sighting.descriptionPlaceholder')}
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={notes}
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: 380, animated: true });
                }, 120);
              }}
              onChangeText={setNotes}
              editable={!isLocked}
            />

            {!isLocked && (
              <>
                <Text style={styles.observationTagsLabel}>
                  Etiquetas de comportamiento sugeridas:
                </Text>
                <View style={styles.tagsRow}>
                  {OBSERVATION_TAGS.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.tagChip}
                      onPress={() => handleAddTag(tag)}
                    >
                      <Ionicons
                        name="add"
                        size={12}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.tagChipText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* 5. Ubicación y Mapa Interactivo */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="location-outline"
                  size={17}
                  color={colors.primary}
                />
                <Text style={styles.sectionTitle}>
                  {t('sighting.locationCoordinates')}
                </Text>
              </View>

              {!isLocked && (
                <TouchableOpacity
                  style={styles.myLocationBtn}
                  onPress={() => {
                    Keyboard.dismiss();
                    handleUseCurrentLocation();
                  }}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <MaterialCommunityIcons
                      name="crosshairs-gps"
                      size={15}
                      color={colors.primary}
                    />
                  )}
                  <Text style={styles.myLocationBtnText}>
                    {t('sighting.myLocationBtn')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                showsCompass={false}
                showsMyLocationButton={false}
                customMapStyle={isDark ? MAP_STYLE : []}
                region={region}
                onPress={(e) => {
                  if (!canEdit) return;
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setRegion((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                  }));
                }}
                scrollEnabled={!isLocked}
              >
                <Marker
                  coordinate={{
                    latitude: region.latitude,
                    longitude: region.longitude,
                  }}
                  draggable={!isLocked}
                  onDragEnd={(e) => {
                    if (!canEdit) return;
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setRegion((prev) => ({
                      ...prev,
                      latitude,
                      longitude,
                    }));
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 3,
                        borderColor: colors.surface,
                        elevation: 5,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="bird"
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>
                  </View>
                </Marker>
              </MapView>

              {/* Insignia flotante sobre el mapa */}
              <View style={styles.mapFloatingBadge}>
                <Ionicons name="navigate-outline" size={12} color="#FFFFFF" />
                <Text style={styles.mapFloatingText}>
                  {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
                </Text>
              </View>

              {/* Botón flotante para centrar ubicación GPS */}
              {!isLocked && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleUseCurrentLocation}
                  disabled={isLocating}
                  style={styles.mapGpsFab}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <MaterialCommunityIcons
                      name="target"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Ajuste manual de coordenadas (desplegable) */}
            <TouchableOpacity
              style={styles.manualCoordsToggle}
              onPress={() => {
                Keyboard.dismiss();
                setShowManualCoords(!showManualCoords);
              }}
            >
              <Ionicons
                name={showManualCoords ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
              />
              <Text style={styles.manualCoordsToggleText}>
                {showManualCoords
                  ? 'Ocultar coordenadas manuales'
                  : 'Ajuste manual de coordenadas (lat / lon)'}
              </Text>
            </TouchableOpacity>

            {showManualCoords && (
              <View style={styles.coordsInputsRow}>
                <View style={styles.coordInputWrap}>
                  <Text style={styles.coordInputLabel}>Lat:</Text>
                  <TextInput
                    style={styles.coordTextInput}
                    placeholder="24.1426"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="numeric"
                    value={region.latitude.toString()}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollRef.current?.scrollToEnd({ animated: true });
                      }, 120);
                    }}
                    onChangeText={(val) => {
                      const lat = parseFloat(val) || 0;
                      handleRegionChange(lat);
                    }}
                    editable={!isLocked}
                  />
                </View>

                <View style={styles.coordInputWrap}>
                  <Text style={styles.coordInputLabel}>Lon:</Text>
                  <TextInput
                    style={styles.coordTextInput}
                    placeholder="-110.3128"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="numeric"
                    value={region.longitude.toString()}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollRef.current?.scrollToEnd({ animated: true });
                      }, 120);
                    }}
                    onChangeText={(val) => {
                      if (!canEdit) return;
                      const lon = parseFloat(val) || 0;
                      setRegion((prev) => ({
                        ...prev,
                        longitude: lon,
                      }));
                      mapRef.current?.animateToRegion({
                        ...region,
                        longitude: lon,
                      });
                    }}
                    editable={!isLocked}
                  />
                </View>
              </View>
            )}
          </View>

          {/* 6. Interruptor de Privacidad */}
          <View style={styles.privacyCard}>
            <View style={styles.privacyIconCircle}>
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>
                {t('feed.locationPrivate')}
              </Text>
              <Text style={styles.privacySubtitle}>
                {t('sighting.privateLocationDesc')}
              </Text>
            </View>
            <AnimatedSwitch value={isPrivate} onValueChange={setIsPrivate} />
          </View>

          {/* 7. Botón de Publicación / Guardar */}
          <PressableScale
            activeScale={0.97}
            haptic="medium"
            style={[styles.publishButton, isPosting && { opacity: 0.7 }]}
            onPress={() => {
              Keyboard.dismiss();
              handlePost();
            }}
            disabled={isPosting}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name={isEditMode ? 'checkmark-circle' : 'paper-plane'}
                  size={19}
                  color="#FFFFFF"
                />
                <Text style={styles.publishButtonText}>
                  {isEditMode
                    ? t('sighting.saveEditBtn')
                    : t('sighting.publishBtn')}
                </Text>
              </>
            )}
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>

      <PhotoSourceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectSource={(source) => {
          setModalVisible(false);
          handlePickImage(source);
        }}
        panY={panY}
        backdropOpacity={backdropOpacity}
        panResponder={panResponder}
        screenHeight={screenHeight}
        colors={colors}
      />
    </SafeAreaView>
  );
}
