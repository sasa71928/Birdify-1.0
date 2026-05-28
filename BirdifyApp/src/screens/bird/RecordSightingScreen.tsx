import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Animated,
  PanResponder,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Typography, Spacing, Radius, Shadows } from '../../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import BottomNavBar from '../../components/BottomNavBar';
import { createStyles } from '../../styles/screens/bird/recordSightingScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { BirdRepository } from '../../repositories/bird.repository';
import { SightingRepository } from '../../repositories/sighting.repository';

// Decodificador nativo
function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') bufferLength--;
  }
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);
  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const base641 = lookup[base64.charCodeAt(i)];
    const base642 = lookup[base64.charCodeAt(i + 1)];
    const base643 = lookup[base64.charCodeAt(i + 2)];
    const base644 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = (base641 << 2) | (base642 >> 4);
    if (p < bufferLength) bytes[p++] = ((base642 & 15) << 4) | (base643 >> 2);
    if (p < bufferLength) bytes[p++] = ((base643 & 3) << 6) | (base644 & 63);
  }
  return arrayBuffer;
}

const MOCK_BIRDS_CATALOG = [
  { id: '1', common_name: 'Cardenal Rojo', scientific_name: 'Cardinalis cardinalis' },
  { id: '2', common_name: 'Azulejo', scientific_name: 'Cyanocitta cristata' },
  { id: '3', common_name: 'Petirrojo Americano', scientific_name: 'Turdus migratorius' },
  { id: '4', common_name: 'Colibrí Garganta Rubí', scientific_name: 'Archilochus colubris' },
  { id: '5', common_name: 'Paloma Huilota', scientific_name: 'Zenaida macroura' },
  { id: '6', common_name: 'Águila Calva', scientific_name: 'Haliaeetus leucocephalus' },
  { id: '7', common_name: 'Zenzontle', scientific_name: 'Mimus polyglottos' },
];

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

  const MAP_STYLE = useMemo(
  () => createMapStyle(colors),
  [colors]
);

  const { user } = useAuth();

  const editingSightingId = route?.params?.editingSighting;
  const isEditMode = !!editingSightingId;
  const [editingSighting, setEditingSighting] = useState<any>(null);


  const [birdName, setBirdName] = useState('');
  const [notes, setNotes] = useState('');

  
  const [selectedBird, setSelectedBird] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [imageBase64s, setImageBase64s] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [shouldNavigateToFeed, setShouldNavigateToFeed] = useState(false);

  const [toast, setToast] = useState<{ visible: boolean, message: string, type: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    if (!editingSightingId) return;

    const loadSighting = async () => {
      const { data, error } = await supabase
        .from('sightings')
        .select(`*, 
          birds (id, common_name, scientific_name)`)
        .eq('id', editingSightingId)
        .single();

      if (error) {
        console.error(error);
        return;
      }
      setEditingSighting(data);
      
    };

    loadSighting();
  }, [editingSightingId]);

  useEffect(() => {
    if (!editingSighting) return;

    setBirdName(editingSighting.birds?.common_name || '');

    setNotes(editingSighting.description || '');

    setRegion({
      latitude: editingSighting.latitude || 24.1426,
      longitude: editingSighting.longitude || -110.3128,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    });

    // imagen
   const raw = editingSighting.photo_url; // <-- IMPORTANTE

    let parsed: string[] = [];

    try {
      if (Array.isArray(raw)) {
        parsed = raw;
      } else if (typeof raw === 'string') {
        parsed = raw.startsWith('[') ? JSON.parse(raw) : [raw];
      }
    } catch {
      parsed = [];
    }

    setImageUris(parsed);

    setIsPrivate(!!editingSighting.is_location_private);

    // si tienes bird_id, aquí deberías resolver el nombre
  }, [editingSighting]);

  const EDIT_LIMIT_MINUTES = 5;


  const createdAt = useMemo(() => {
    return editingSighting?.created_at
      ? new Date(editingSighting.created_at)
      : null;
  }, [editingSighting]);

  const isLocked = useMemo(() => {
    if (!createdAt) return false;
    if (!isEditMode) return false;
    return Date.now() - createdAt.getTime() > EDIT_LIMIT_MINUTES * 60000;
  }, [isEditMode, createdAt]);

  const canEdit = !isLocked;

  useEffect(() => {
    if (!toast.visible) return;

    const timeoutId = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);

    return () => clearTimeout(timeoutId);
  }, [toast.visible]);

  useEffect(() => {
    if (!shouldNavigateToFeed) return;

    const timeoutId = setTimeout(() => {
      navigation.navigate('MainTabs', { screen: 'Feed' });
      setShouldNavigateToFeed(false);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [shouldNavigateToFeed, navigation]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };
  
  // Mapa y Ubicación
  const [region, setRegion] = useState({
    latitude: 24.1426,
    longitude: -110.3128,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  });
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Selector de foto (Bottom Sheet Modal)
  const [modalVisible, setModalVisible] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          Animated.timing(panY, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setModalVisible(false);
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8
          }).start();
        }
      },
    })
  ).current;

  const backdropOpacity = panY.interpolate({
    inputRange: [0, screenHeight],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).start();
    } else {
      panY.setValue(screenHeight);
    }
  }, [modalVisible, screenHeight]);

  // Estilos del modal integrados con el tema
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

  const handlePickImage = async (source: 'gallery' | 'camera') => {
    try {
      if (imageUris.length >= 10) {
        return Alert.alert('Límite alcanzado', 'Puedes añadir un máximo de 10 imágenes.');
      }

      if (source === 'gallery') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permiso denegado', 'Se requiere acceso a tu galería.');
      } else {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara.');
      }

      let result;
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: 'images',
        allowsEditing: source === 'gallery' ? false : true,
        allowsMultipleSelection: source === 'gallery' ? true : false,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      };

      if (source === 'gallery') {
        result = await ImagePicker.launchImageLibraryAsync(options);
      } else {
        result = await ImagePicker.launchCameraAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map(asset => asset.uri);
        const newBase64s = result.assets.map(asset => asset.base64 || '');
        const totalImages = imageUris.length + newUris.length;

        if (totalImages > 10) {
          const available = 10 - imageUris.length;
          setImageUris([...imageUris, ...newUris.slice(0, available)]);
          setImageBase64s([...imageBase64s, ...newBase64s.slice(0, available)]);
          Alert.alert('Límite alcanzado', `Solo se pudieron añadir ${available} de ${newUris.length} imágenes.`);
        } else {
          setImageUris([...imageUris, ...newUris]);
          setImageBase64s([...imageBase64s, ...newBase64s]);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se puede acceder a tu ubicación actual.');
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al obtener tu ubicación.');
    } finally {
      setIsLocating(false);
    }
  };

  const handlePost = async () => {
    if (!user) return Alert.alert('Sesión Inválida', 'Inicia sesión para compartir un avistamiento.');
    if (!birdName.trim()) return Alert.alert('Información incompleta', 'Debes nombrar o describir al ave.');
    if (!isEditMode && imageBase64s.length === 0) return Alert.alert('Información incompleta', '¡Debes añadir al menos una foto!');

    setIsPosting(true);
    try {
      // 1. Buscar ave en base de datos.
      let finalBirdId = null;
      const searchName = selectedBird ? selectedBird.common_name : birdName;
      const birds = await BirdRepository.search(searchName);

      if (birds && birds.length > 0) {
        finalBirdId = birds[0].id;
      } else {
        // Registrar el ave automáticamente en el catálogo si no existe
        const { data: newBird, error: birdError } = await supabase
          .from('birds')
          .insert({
            common_name: searchName,
            scientific_name: selectedBird?.scientific_name || (searchName + ' sp.'),
            description: 'Registrado dinámicamente durante un avistamiento.',
            season: 'Desconocido',
            habitat_info: 'Desconocido',
            ideal_zones: 'Desconocido'
          })
          .select()
          .single();

        if (birdError) {
          throw new Error('Error al registrar especie en el catálogo: ' + birdError.message);
        }
        finalBirdId = newBird.id;
      }

      // --- FLUJO DE SUBIDA DE MÚLTIPLES IMÁGENES A SUPABASE ---
      let photoUrls: string[] = [];

      if (isEditMode && imageBase64s.length === 0) {
        photoUrls = Array.isArray(editingSighting.image) ? editingSighting.image : [editingSighting.image];
      } else {
        for (let i = 0; i < imageBase64s.length; i++) {
          const base64 = imageBase64s[i];
          const uri = imageUris[i];
          const fileExt = uri?.split('.').pop() || 'jpg';
          const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
          const arrayBuffer = decodeBase64ToArrayBuffer(base64);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Sightings')
            .upload(fileName, arrayBuffer, {
              contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
              upsert: true,
            });

          if (uploadError) {
            throw new Error('Error al subir imagen: ' + uploadError.message);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('Sightings')
            .getPublicUrl(fileName);

          photoUrls.push(publicUrl);
        }
      }

      const sightingData = {
        bird_id: finalBirdId,
        description: notes,
        latitude: region.latitude,
        longitude: region.longitude,
        is_location_private: isPrivate,
        photo_url: photoUrls.length === 1 ? photoUrls[0] : JSON.stringify(photoUrls) as any,
      };

      if (isEditMode) {
        await SightingRepository.update(editingSighting.id, sightingData);
        showToast('¡Avistamiento actualizado con éxito!', 'success');
      } else {
        await SightingRepository.create({
          ...sightingData,
          user_id: user.id,
          sighting_date: new Date().toISOString()
        });
        showToast('¡Avistamiento publicado con éxito!', 'success');
      }

      setShouldNavigateToFeed(true);

    } catch (error: any) {
      showToast(error.message || 'No se pudo publicar el avistamiento.', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  

  return (
    <SafeAreaView style={shared.safe}>
      {toast.visible && (
        <View style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 50 : 20,
          left: 20,
          right: 20,
          backgroundColor: toast.type === 'success' ? '#2E7D32' : '#C62828',
          padding: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          zIndex: 9999,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8
        }}>
          <Ionicons 
            name={toast.type === 'success' ? "checkmark-circle" : "alert-circle"} 
            size={22} 
            color="#fff" 
          />
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 }}>{toast.message}</Text>
        </View>
      )}
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
                        onPress={() => {
                          setImageUris(imageUris.filter((_, i) => i !== index));
                          setImageBase64s(imageBase64s.filter((_, i) => i !== index));
                        }}
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
                    <TouchableOpacity onPress={() => { setBirdName(''); setSelectedBird(null); setShowDropdown(false); }}>
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
                    {MOCK_BIRDS_CATALOG.filter(b => b.common_name.toLowerCase().includes(birdName.toLowerCase()) || b.scientific_name.toLowerCase().includes(birdName.toLowerCase())).map((bird) => (
                      <TouchableOpacity
                        key={bird.id}
                        style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border + '20' }}
                        onPress={() => {
                          if (!canEdit) return;
                          setBirdName(bird.common_name);
                          setSelectedBird(bird);
                          setShowDropdown(false);
                        }}
                      >
                        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>{bird.common_name}</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' }}>{bird.scientific_name}</Text>
                      </TouchableOpacity>
                    ))}
                    {MOCK_BIRDS_CATALOG.filter(b => b.common_name.toLowerCase().includes(birdName.toLowerCase()) || b.scientific_name.toLowerCase().includes(birdName.toLowerCase())).length === 0 && (
                      <View style={{ padding: 12 }}>
                        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No se encontraron especies.</Text>
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
                    if (!canEdit) return;
                    const latitude = parseFloat(val) || 0;

                    setRegion(prev => ({
                      ...prev,
                      latitude,
                    }));

                    mapRef.current?.animateToRegion({
                      ...region,
                      latitude,
                    });
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

      <BottomNavBar />

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

