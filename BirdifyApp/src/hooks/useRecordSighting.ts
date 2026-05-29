import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Dimensions, Animated, PanResponder } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { BirdRepository } from '../repositories/bird.repository';
import { SightingRepository } from '../repositories/sighting.repository';
import { handleError, showSuccess } from '../utils/errorHandler';

type RecordSightingNavProp = NativeStackNavigationProp<RootStackParamList>;

const MOCK_BIRDS_CATALOG = [
  { id: '1', common_name: 'Cardenal Rojo', scientific_name: 'Cardinalis cardinalis' },
  { id: '2', common_name: 'Azulejo', scientific_name: 'Cyanocitta cristata' },
  { id: '3', common_name: 'Petirrobo Americano', scientific_name: 'Turdus migratorius' },
  { id: '4', common_name: 'Colibrí Garganta Rubí', scientific_name: 'Archilochus colubris' },
  { id: '5', common_name: 'Paloma Huilota', scientific_name: 'Zenaida macroura' },
  { id: '6', common_name: 'Águila Calva', scientific_name: 'Haliaeetus leucocephalus' },
  { id: '7', common_name: 'Zenzontle', scientific_name: 'Mimus polyglottos' },
];

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

export function useRecordSighting(editingSightingId?: string) {
  const navigation = useNavigation<RecordSightingNavProp>();
  const { user } = useAuth();
  
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
  
  const [region, setRegion] = useState({
    latitude: 24.1426,
    longitude: -110.3128,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  });
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<MapView>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;
  
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
    if (!editingSightingId) return;

    const loadSighting = async () => {
      const { data, error } = await supabase
        .from('sightings')
        .select(`*, 
          birds (id, common_name, scientific_name)`)
        .eq('id', editingSightingId)
        .single();

      if (error) {
        handleError(error, setToast, 'Error loading sighting');
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

    const raw = editingSighting.photo_url;
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
  }, [editingSighting]);

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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };

  const handlePickImage = async (source: 'gallery' | 'camera') => {
    try {
      if (imageUris.length >= 10) {
        handleError('Límite alcanzado', setToast, 'Puedes añadir un máximo de 10 imágenes.');
        return;
      }

      if (source === 'gallery') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          handleError('Permiso denegado', setToast, 'Se requiere acceso a tu galería.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          handleError('Permiso denegado', setToast, 'Se requiere acceso a la cámara.');
          return;
        }
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
          handleError('Límite alcanzado', setToast, `Solo se pudieron añadir ${available} de ${newUris.length} imágenes.`);
        } else {
          setImageUris([...imageUris, ...newUris]);
          setImageBase64s([...imageBase64s, ...newBase64s]);
        }
      }
    } catch (err: any) {
      handleError(err, setToast, 'Error al seleccionar imagen');
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        handleError('Permiso denegado', setToast, 'No se puede acceder a tu ubicación actual.');
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
      handleError(error, setToast, 'Hubo un problema al obtener tu ubicación.');
    } finally {
      setIsLocating(false);
    }
  };

  const handlePost = async () => {
    if (!user) {
      handleError('Sesión Inválida', setToast, 'Inicia sesión para compartir un avistamiento.');
      return;
    }
    if (!birdName.trim()) {
      handleError('Información incompleta', setToast, 'Debes nombrar o describir al ave.');
      return;
    }
    if (!isEditMode && imageBase64s.length === 0) {
      handleError('Información incompleta', setToast, '¡Debes añadir al menos una foto!');
      return;
    }

    setIsPosting(true);
    try {
      let finalBirdId = null;
      const searchName = selectedBird ? selectedBird.common_name : birdName;
      const birds = await BirdRepository.search(searchName);

      if (birds && birds.length > 0) {
        finalBirdId = birds[0].id;
      } else {
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

  const handleRemoveImage = (index: number) => {
    setImageUris(imageUris.filter((_, i) => i !== index));
    setImageBase64s(imageBase64s.filter((_, i) => i !== index));
  };

  const handleBirdSelect = (bird: any) => {
    if (!canEdit) return;
    setBirdName(bird.common_name);
    setSelectedBird(bird);
    setShowDropdown(false);
  };

  const handleClearBird = () => {
    setBirdName('');
    setSelectedBird(null);
    setShowDropdown(false);
  };

  const handleRegionChange = (latitude: number) => {
    if (!canEdit) return;
    setRegion(prev => ({
      ...prev,
      latitude,
    }));
    mapRef.current?.animateToRegion({
      ...region,
      latitude,
    });
  };

  const filteredBirds = MOCK_BIRDS_CATALOG.filter(b => 
    b.common_name.toLowerCase().includes(birdName.toLowerCase()) || 
    b.scientific_name.toLowerCase().includes(birdName.toLowerCase())
  );

  return {
    // State
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
    MOCK_BIRDS_CATALOG,
    mapRef,
    panY,
    backdropOpacity,
    panResponder,
    
    // Setters
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
    
    // Actions
    handlePickImage,
    handleUseCurrentLocation,
    handlePost,
    handleRemoveImage,
    handleBirdSelect,
    handleClearBird,
    handleRegionChange,
    showToast,
  };
}
