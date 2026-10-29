import { useState, useRef, useEffect, useMemo } from 'react';
import { isOnline, addToQueue, generateId } from '../services/syncService';
import db from '../lib/database';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Dimensions, Animated, PanResponder } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { BirdRepository } from '../repositories/bird.repository';
import { SightingRepository } from '../repositories/sighting.repository';
import { handleError } from '../utils/errorHandler';

type RecordSightingNavProp = NativeStackNavigationProp<RootStackParamList>;

export function useRecordSighting(editingSightingId?: string) {
  const navigation = useNavigation<RecordSightingNavProp>();
  const { user } = useAuth();

  const isEditMode = !!editingSightingId;
  const [editingSighting, setEditingSighting] = useState<any>(null);

  const [dbBirdsCatalog, setDbBirdsCatalog] = useState<
    { id: string; common_name: string; scientific_name: string }[]
  >([]);

  useEffect(() => {
    let mounted = true;
    BirdRepository.getAll()
      .then((birds) => {
        if (mounted) {
          setDbBirdsCatalog(
            birds.map((b) => ({
              id: b.id,
              common_name: b.common_name,
              scientific_name: b.scientific_name,
            }))
          );
        }
      })
      .catch((e) => console.error('Failed to load birds catalog', e));
    return () => {
      mounted = false;
    };
  }, []);

  const [birdName, setBirdName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedBird, setSelectedBird] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [imageBase64s, setImageBase64s] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [shouldNavigateToFeed, setShouldNavigateToFeed] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

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
    return editingSighting?.created_at ? new Date(editingSighting.created_at) : null;
  }, [editingSighting]);

  const isLocked = useMemo(() => {
    if (!createdAt) return false;
    if (!isEditMode) return false;
    if (editingSighting?.sync_status === 'pending') return false;

    return Date.now() - createdAt.getTime() > EDIT_LIMIT_MINUTES * 60000;
  }, [isEditMode, createdAt, editingSighting?.sync_status]);

  const canEdit = !isLocked;

  useEffect(() => {
    if (!editingSightingId) return;

    const loadSighting = async () => {
      if (!isOnline) {
        try {
          const row = await db.getFirstAsync<any>(
            `SELECT s.*, b.common_name, b.scientific_name 
             FROM sightings s 
             LEFT JOIN birds b ON b.id = s.bird_id 
             WHERE s.id = ?`,
            [editingSightingId]
          );
          if (row) {
            setEditingSighting({
              ...row,
              birds: {
                id: row.bird_id,
                common_name: row.common_name,
                scientific_name: row.scientific_name,
              },
            });
          }
        } catch (e) {
          console.error('Error loading offline sighting:', e);
        }
        return;
      }

      const { data, error } = await supabase
        .from('sightings')
        .select(`*, birds (id, common_name, scientific_name)`)
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
    if (editingSighting.birds?.id) {
      setSelectedBird(editingSighting.birds);
    }
    setNotes(editingSighting.description || '');
    setRegion({
      latitude: editingSighting.latitude || 24.1426,
      longitude: editingSighting.longitude || -110.3128,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    });

    const raw = editingSighting.local_photo_path || editingSighting.photo_url;
    let parsed: string[] = [];

    try {
      if (Array.isArray(raw)) {
        parsed = raw.filter(Boolean);
      } else if (typeof raw === 'string' && raw.trim() !== '') {
        parsed = raw.startsWith('[') ? JSON.parse(raw).filter(Boolean) : [raw];
      }
    } catch {
      parsed = [];
    }

    setImageUris(parsed);
    setImageBase64s([]);
    setIsPrivate(!!editingSighting.is_location_private);
  }, [editingSighting]);

  useEffect(() => {
    if (!toast.visible) return;

    const timeoutId = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
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
            friction: 8,
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
        friction: 8,
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

      // AUD-022: No solicitar base64 en ImagePicker para evitar retener >150 MB en el heap de Hermes
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: source !== 'gallery',
        allowsMultipleSelection: source === 'gallery',
        aspect: [4, 3],
        quality: 0.8,
        exif: false,
      };

      const result = source === 'gallery'
        ? await ImagePicker.launchImageLibraryAsync(options)
        : await ImagePicker.launchCameraAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        const totalImages = imageUris.length + newUris.length;

        if (totalImages > 10) {
          const available = 10 - imageUris.length;
          setImageUris([...imageUris, ...newUris.slice(0, available)]);
          handleError(
            'Límite alcanzado',
            setToast,
            `Solo se pudieron añadir ${available} de ${newUris.length} imágenes.`
          );
        } else {
          setImageUris([...imageUris, ...newUris]);
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

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
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

  const resolveCatalogBird = async (searchName: string): Promise<{ id: string; common_name: string; scientific_name?: string } | null> => {
    if (selectedBird?.id) {
      return selectedBird;
    }

    const exactCatalogMatch = dbBirdsCatalog.find(
      (b) => b.common_name.toLowerCase() === searchName.toLowerCase()
    );
    if (exactCatalogMatch) {
      return exactCatalogMatch;
    }

    if (!isOnline) {
      const existingLocalBird = await db.getFirstAsync<{ id: string; common_name: string; scientific_name: string }>(
        `SELECT id, common_name, scientific_name FROM birds WHERE LOWER(common_name) = LOWER(?) LIMIT 1`,
        [searchName]
      );
      return existingLocalBird ?? null;
    }

    const birds = await BirdRepository.search(searchName);
    const exactRemote = birds?.find(
      (b: any) => b.common_name?.toLowerCase() === searchName.toLowerCase()
    ) || birds?.[0];

    if (exactRemote?.id) {
      return exactRemote as any;
    }

    return null;
  };

  const handlePost = async () => {
    // AUD-026: Bloqueo sincrónico inmediato para impedir envíos duplicados por doble pulsación
    if (isSubmittingRef.current || isPosting) return;

    if (!user) {
      handleError('Sesión Inválida', setToast, 'Inicia sesión para compartir un avistamiento.');
      return;
    }
    if (!birdName.trim()) {
      handleError('Información incompleta', setToast, 'Debes seleccionar una especie de ave.');
      return;
    }
    if (imageUris.length === 0) {
      handleError('Información incompleta', setToast, '¡Debes añadir al menos una foto!');
      return;
    }

    isSubmittingRef.current = true;
    setIsPosting(true);
    try {
      const searchName = (selectedBird ? selectedBird.common_name : birdName).trim();
      const matchedBird = await resolveCatalogBird(searchName);

      // AUD-011: Validar siempre contra el catálogo oficial (online y offline) para evitar asignación aleatoria o bloqueo en sync_queue
      if (!matchedBird?.id) {
        throw new Error(
          'Selecciona una especie existente del catálogo desplegable para registrar el avistamiento.'
        );
      }

      // ── FLUJO OFFLINE ──────────────────────────────────────────────
      if (!isOnline) {
        const localPhotoUrls = imageUris.length === 1 ? imageUris[0] : JSON.stringify(imageUris);

        if (isEditMode && editingSighting?.id) {
          await SightingRepository.update(editingSighting.id, {
            bird_id: matchedBird.id,
            description: notes,
            latitude: isPrivate ? null : region.latitude,
            longitude: isPrivate ? null : region.longitude,
            is_location_private: isPrivate,
            photo_url: localPhotoUrls,
          } as any);
          showToast('¡Avistamiento actualizado en modo sin conexión!', 'success');
          setShouldNavigateToFeed(true);
          return;
        }

        const sightingId = generateId();
        const nowIso = new Date().toISOString();

        await db.runAsync(
          `INSERT INTO sightings 
            (id, user_id, bird_id, description, latitude, longitude, 
            is_location_private, photo_url, local_photo_path, sighting_date, created_at, sync_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [
            sightingId,
            user.id,
            matchedBird.id,
            notes,
            isPrivate ? null : region.latitude,
            isPrivate ? null : region.longitude,
            isPrivate ? 1 : 0,
            localPhotoUrls,
            JSON.stringify(imageUris),
            nowIso,
            nowIso,
          ]
        );

        await addToQueue('sightings', 'INSERT', {
          id: sightingId,
          user_id: user.id,
          bird_id: matchedBird.id,
          description: notes,
          latitude: isPrivate ? null : region.latitude,
          longitude: isPrivate ? null : region.longitude,
          is_location_private: isPrivate,
          sighting_date: nowIso,
          created_at: nowIso,
          _localImagePaths: JSON.stringify(imageUris),
          _birdName: matchedBird.common_name,
          _scientificName: matchedBird.scientific_name ?? null,
        });

        showToast(
          'Avistamiento guardado offline. Se sincronizará al recuperar conexión.',
          'success'
        );
        setShouldNavigateToFeed(true);
        return;
      }

      // ── FLUJO ONLINE ───────────────────────────────────────────────
      // AUD-011 & AUD-022: Preservar URLs remotas existentes al editar y subir binarios nuevos uno a uno sin Base64 en memoria
      const photoUrls: string[] = [];

      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];

        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          photoUrls.push(uri);
          continue;
        }

        const rawExt = uri?.split('?')[0]?.split('.').pop()?.toLowerCase() || 'jpg';
        const fileExt = rawExt === 'png' || rawExt === 'webp' ? rawExt : 'jpg';
        const mimeType =
          fileExt === 'png'
            ? 'image/png'
            : fileExt === 'webp'
              ? 'image/webp'
              : 'image/jpeg';
        const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;

        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();

        let bucketName = 'Sightings';
        let { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, arrayBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError && (uploadError as any).code === 'NoSuchBucket') {
          bucketName = 'sightings';
          const retry = await supabase.storage
            .from(bucketName)
            .upload(fileName, arrayBuffer, {
              contentType: mimeType,
              upsert: true,
            });
          uploadError = retry.error;
        }

        if (uploadError) {
          throw new Error('Error al subir imagen: ' + uploadError.message);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(fileName);

        photoUrls.push(publicUrl);
      }

      const sightingData = {
        bird_id: matchedBird.id,
        description: notes,
        latitude: isPrivate ? null : region.latitude,
        longitude: isPrivate ? null : region.longitude,
        is_location_private: isPrivate,
        photo_url:
          photoUrls.length === 1 ? photoUrls[0] : (JSON.stringify(photoUrls) as any),
      };

      if (isEditMode) {
        await SightingRepository.update(editingSighting.id, sightingData);
        showToast('¡Avistamiento actualizado con éxito!', 'success');
      } else {
        await SightingRepository.create({
          ...sightingData,
          user_id: user.id,
          sighting_date: new Date().toISOString(),
          _localImagePaths: imageUris.length > 0 ? JSON.stringify(imageUris) : null,
          _birdName: matchedBird.common_name,
          _scientificName: matchedBird.scientific_name ?? null,
        } as any);
        showToast('¡Avistamiento publicado con éxito!', 'success');
      }

      setShouldNavigateToFeed(true);
    } catch (error: any) {
      showToast(error.message || 'No se pudo publicar el avistamiento.', 'error');
    } finally {
      isSubmittingRef.current = false;
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
    setRegion((prev) => ({
      ...prev,
      latitude,
    }));
    mapRef.current?.animateToRegion({
      ...region,
      latitude,
    });
  };

  const filteredBirds = dbBirdsCatalog.filter(
    (b) =>
      b.common_name.toLowerCase().includes(birdName.toLowerCase()) ||
      b.scientific_name.toLowerCase().includes(birdName.toLowerCase())
  );

  return {
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
  };
}
