import React, { useRef, useMemo, useContext } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, OfflineContext } from '../../navigation/AppNavigator';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import BottomNavBar from '../../components/BottomNavBar';
import { createStyles } from '../../styles/screens/bird/recordSightingScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useRecordSighting } from '../../hooks/useRecordSighting';
import { Shadows } from '../../theme';
import AppToast from '../../components/AppToast';

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

  

export default function RecordSightingScreen({ route }: { route: any }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { shared, screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const isOffline = useContext(OfflineContext);

  const MAP_STYLE = useMemo(
  () => createMapStyle(colors),
  [colors]
);

  const editingSightingId = route?.params?.editingSighting;
  const screenHeight = Dimensions.get('window').height;
  
  const {
    birdName,
    notes,
    selectedBird,
    showDropdown,
    imageUris,
    imageBase64s,
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
    setImageUris,
    setImageBase64s,
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
    showToast,
  } = useRecordSighting(editingSightingId);

  const modalStyles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    dismissArea: { flex: 1 },
    sheetContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 24, paddingBottom: 36, alignItems: 'center'
    },
    dragIndicator: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border + '40', marginBottom: 16 },
    sheetTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 },
    sheetSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
    optionsContainer: { width: '100%', gap: 12 },
    optionBtn: { width: '100%', height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    optionIcon: { marginRight: 10 },
    optionText: { color: colors.canvasPure, fontSize: 15, fontWeight: '600' }
  });

  

  return (
    <SafeAreaView style={shared.safe}>
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TopNavBar />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Registrar Avistamiento</Text>
          <Text style={styles.subtitle}>Documenta una nueva observación para tu bitácora y la comunidad.</Text>
          {isLocked && (
            <Text style={{ color: 'orange', marginBottom: 10 }}>
              Solo puedes modificar la privacidad. El resto de campos ya no es editable después de 5 minutos.
            </Text>
          )}

          {/* Photo Upload Area */}
          <View
            style={[styles.photoContainer, { borderColor: imageUris.length > 0 ? colors.primary : colors.border + '40', borderWidth: imageUris.length > 0 ? 2 : 1 }]}
          >
            {imageUris.length > 0 ? (
              <ScrollView
                style={{ maxHeight: 500 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                scrollEnabled={imageUris.length > 4}
              >
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 12 }}>
                  {imageUris.map((uri, index) => (
                    <View key={index} style={{ width: '47%', aspectRatio: 1 }}>
                      <Image
                        source={{ uri }}
                        style={{ width: '100%', height: '100%', borderRadius: 12 }}
                      />
                      <TouchableOpacity
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: '#FF5252',
                          borderRadius: 50,
                          padding: 4,
                        }}
                        disabled={isLocked}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close" size={16} color="white" />
                      </TouchableOpacity>
                      <View style={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        backgroundColor: colors.primary + 'dd',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                          {index + 1}/{imageUris.length}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {imageUris.length < 10 && !isLocked && (
                    <TouchableOpacity
                      style={{
                        width: '47%',
                        aspectRatio: 1,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderStyle: 'dashed',
                        borderColor: colors.primary + '40',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => setModalVisible(true)}
                    >
                      <Ionicons name="add" size={32} color={colors.primary + '60'} />
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            ) : (
              <TouchableOpacity
                style={styles.photoInner}
                onPress={() => setModalVisible(true)}
                activeOpacity={1}
              >
                <View style={styles.cameraIconBg}>
                    <Ionicons name="camera-outline" size={32} color={colors.primary} />
                    <View style={styles.plusIconBadge}>
                        <Ionicons name="add" size={12} color={colors.primary} />
                    </View>
                </View>
                <Text style={styles.photoTitle}>Toca para añadir foto</Text>
                <Text style={styles.photoSubtitle}>Puedes añadir hasta 10 fotos (calidad alta)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Form Fields - Ajustando Contrastes */}
          <View style={[styles.section, { zIndex: 10 }]}>
            
            <Text style={styles.label}>¿Qué ave observaste?</Text>
            <View style={{ position: 'relative' }}>
              <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border + '80' }]}>
                <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput 
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                  placeholder="Busca una especie (Ej: Cardenal Rojo)..."
                  placeholderTextColor={colors.placeholder}
                  value={birdName}
                  onFocus={() => {
                    if (!canEdit) return;
                    if (birdName.length > 0) setShowDropdown(true);
                  }}
                  onChangeText={(text) => {
                    if (!canEdit) return;
                    setBirdName(text);
                    setSelectedBird(null);
                    setShowDropdown(text.length > 0);
                  }}
                  editable={!isLocked}
                />
                {birdName.length > 0 && (
                  (!isLocked) && (
                    <TouchableOpacity onPress={handleClearBird}>
                      <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Lista Desplegable (Dropdown) */}
              {showDropdown && (
                <View style={{
                  position: 'absolute',
                  top: 55,
                  left: 0,
                  right: 0,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border + '40',
                  borderRadius: 12,
                  maxHeight: 180,
                  zIndex: 20,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8
                }}>
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {filteredBirds.map((bird) => (
                      <TouchableOpacity
                        key={bird.id}
                        style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border + '20' }}
                        onPress={() => {
                          handleBirdSelect(bird);
                        }}
                      >
                        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>{bird.common_name}</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' }}>{bird.scientific_name}</Text>
                      </TouchableOpacity>
                    ))}
                    {filteredBirds.length === 0 && (
                      <View style={{ padding: 12 }}>
                        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Crear "{birdName}" como nueva especie</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          <View style={[styles.section, { zIndex: 1 }]}>
            <Text style={styles.label}>Notas de Observación</Text>
            <View style={[styles.notesContainer, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border + '80' }]}>
              <TextInput 
                style={[styles.notesInput, { color: colors.textPrimary }]}
                placeholder="¿Qué estaba haciendo? Describe su comportamiento, canto o hábitat..."
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
                editable={!isLocked}
              />
            </View>
          </View>

          {/* Location Section - Por Coordenadas y Mapbox Estático */}
          <View style={styles.section}>
            <View style={styles.locationHeader}>
              <Text style={styles.label}>Ubicación (Lat/Lng)</Text>
              {!isLocked && (
                <TouchableOpacity
                  style={styles.useCurrentBtn}
                  onPress={handleUseCurrentLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <MaterialCommunityIcons name="target" size={18} color={colors.primary} />
                  )}
                  <Text style={styles.useCurrentText}>Mi Ubicación</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Inputs de Coordenadas */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <View style={[styles.searchContainer, { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border + '80' }]}>
                <TextInput 
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                  placeholder="Latitud"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  value={region.latitude.toString()}
                  onChangeText={(val) => {
                    const latitude = parseFloat(val) || 0;
                    handleRegionChange(latitude);
                  }}
                  editable={!isLocked}
                />
              </View>
              <View style={[styles.searchContainer, { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border + '80' }]}>
                <TextInput 
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                  placeholder="Longitud"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  value={region.longitude.toString()}
                  onChangeText={(val) => {
                    if (!canEdit) return;
                    const longitude = parseFloat(val) || 0;
                    setRegion(prev => ({
                      ...prev,
                      longitude,
                    }));
                    mapRef.current?.animateToRegion({
                      ...region,
                      longitude,
                    });
                  }}
                  editable={!isLocked}
                />
              </View>
            </View>

            <View
              style={[
                styles.mapContainer,
                {
                  borderRadius: 24,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.border,
                  height: 240,
                  backgroundColor: colors.surface,
                  ...Shadows.card,
                },
              ]}
            >
              <MapView
                ref={mapRef}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                showsCompass={false}
                showsMyLocationButton={false}
                customMapStyle={isDark ? MAP_STYLE : []}
                region={region}
                onPress={(e) => {
                  if (!canEdit) return;
                  const { latitude, longitude } =
                    e.nativeEvent.coordinate;

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
                  draggable
                  onDragEnd={(e) => {
                    if (!canEdit) return;
                    const { latitude, longitude } =
                      e.nativeEvent.coordinate;

                    setRegion((prev) => ({
                      ...prev,
                      latitude,
                      longitude,
                    }));
                  }}
                >
                  <View
                    style={{
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: colors.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 3,
                        borderColor: colors.surface,
                        ...Shadows.card,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="bird"
                        size={22}
                        color={colors.canvasPure}
                      />
                    </View>

                    <View
                      style={{
                        width: 0,
                        height: 0,
                        backgroundColor: 'transparent',
                        borderStyle: 'solid',
                        borderLeftWidth: 6,
                        borderRightWidth: 6,
                        borderTopWidth: 8,
                        borderLeftColor: 'transparent',
                        borderRightColor: 'transparent',
                        borderTopColor: colors.surface,
                        marginTop: -2,
                      }}
                    />
                  </View>
                </Marker>
              </MapView>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleUseCurrentLocation}
                disabled={isLocating || isLocked}
                style={{
                  position: 'absolute',
                  bottom: 14,
                  right: 14,
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: colors.surface,
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...Shadows.card,
                }}
                
              >
                {isLocating ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={24}
                    color={colors.textPrimary}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Private Location Toggle */}
          <View style={[styles.toggleCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border + '40' }]}>
            <View style={styles.toggleLeft}>
              <MaterialCommunityIcons name="eye-off-outline" size={22} color={colors.textSecondary} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Ubicación Privada</Text>
                <Text style={styles.toggleSubtitle}>Oculta las coordenadas exactas de la comunidad</Text>
              </View>
            </View>
            <Switch 
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: colors.componentBase, true: colors.primary + '80' }}
              thumbColor={isPrivate ? colors.primary : colors.canvasPure}
            />
          </View>

          {/* Post Button */}
          <TouchableOpacity
            style={[styles.postButton, isPosting && { opacity: 0.7 }]}
            onPress={handlePost}
            disabled={isPosting}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color={colors.canvasPure} />
            ) : (
              <>
                <Ionicons name={isEditMode ? "checkmark-circle" : "paper-plane"} size={20} color={colors.canvasPure} style={styles.postIcon} />
                <Text style={styles.postButtonText}>{isEditMode ? 'Actualizar Avistamiento' : 'Publicar Avistamiento'}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {!isOffline && <BottomNavBar hideNav />}

      {/* Selector de Foto Custom Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => {
          Animated.timing(panY, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setModalVisible(false);
          });
        }}
      >
        <View style={modalStyles.modalOverlay}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#000', opacity: backdropOpacity }
            ]}
          >
            <TouchableOpacity 
              style={{ flex: 1 }} 
              activeOpacity={1} 
              onPress={() => {
                Animated.timing(panY, {
                  toValue: screenHeight,
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => {
                  setModalVisible(false);
                });
              }} 
            />
          </Animated.View>
          
          <Animated.View style={[modalStyles.sheetContainer, { transform: [{ translateY: panY }] }]}>
            <View {...panResponder.panHandlers} style={{ width: '100%', alignItems: 'center', paddingVertical: 15, marginTop: -10 }}>
              <View style={modalStyles.dragIndicator} />
            </View>
            <Text style={modalStyles.sheetTitle}>Añadir Foto</Text>
            <Text style={modalStyles.sheetSubtitle}>Selecciona de dónde quieres obtener la imagen:</Text>

            <View style={modalStyles.optionsContainer}>
              <TouchableOpacity 
                style={[modalStyles.optionBtn, { backgroundColor: colors.primary }]} 
                activeOpacity={0.85}
                onPress={() => { setModalVisible(false); handlePickImage('camera'); }}
              >
                <Ionicons name="camera" size={20} color={colors.canvasPure} style={modalStyles.optionIcon} />
                <Text style={modalStyles.optionText}>Tomar Foto con Cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[modalStyles.optionBtn, { backgroundColor: colors.primary }]} 
                activeOpacity={0.85}
                onPress={() => { setModalVisible(false); handlePickImage('gallery'); }}
              >
                <Ionicons name="images" size={20} color={colors.canvasPure} style={modalStyles.optionIcon} />
                <Text style={modalStyles.optionText}>Seleccionar de Galería</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

