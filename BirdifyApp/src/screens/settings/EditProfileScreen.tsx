import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from '../../styles/screens/settings/settingsSubScreens.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { ProfileRepository } from '../../repositories/profile.repository';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
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
    if (p < bufferLength) {
      bytes[p++] = ((base642 & 15) << 4) | (base643 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((base643 & 3) << 6) | (base644 & 63);
    }
  }

  return arrayBuffer;
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();

  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSelectAvatarSource = () => {
    setModalVisible(true);
  };

  const pickAndUploadImage = async (source: 'gallery' | 'camera') => {
    try {
      if (source === 'gallery') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para que puedas elegir tu imagen.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar la foto.');
          return;
        }
      }

      let result;
      if (source === 'gallery') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true, // Requerir base64 para evitar polyfills de Blob inestables en React Native
        });
      } else {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true, // Requerir base64
        });
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedAsset = result.assets[0];
      const imageUri = selectedAsset.uri;
      const base64 = selectedAsset.base64;

      if (!base64) {
        throw new Error('No se pudo decodificar la imagen seleccionada en base64.');
      }

      setIsSaving(true);
      
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;

      // Decodificamos de base64 a ArrayBuffer de forma estable y nativa en JS
      const arrayBuffer = decodeBase64ToArrayBuffer(base64);

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatar(publicUrl);
      Alert.alert('¡Éxito!', 'Foto de perfil cargada correctamente.');
    } catch (error: any) {
      Alert.alert(
        'Error al subir imagen', 
        `Detalle técnico: ${error.message || error.error_description || 'Problema de red o de permisos del bucket.'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await ProfileRepository.getById(user.id);
        if (data) {
          setFullname(data.fullname || '');
          setUsername(data.username || '');
          setEmail(data.email || '');
          setBio(data.bio || '');
          setAvatar(data.profile_pic_url || '');
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos del perfil.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!username.trim()) {
      Alert.alert('Faltan datos', 'El nombre de usuario es obligatorio.');
      return;
    }

    setIsSaving(true);
    try {
      const sanitizedUsername = username.trim().toLowerCase().replace('@', '');
      
      // 1. Validar que el username no esté duplicado
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .ilike('username', sanitizedUsername)
        .neq('id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) {
        Alert.alert('Nombre ocupado', 'Este nombre de usuario ya está siendo usado por otra persona.');
        setIsSaving(false);
        return;
      }

      const finalAvatar = avatar.trim() || 'https://gravatar.com/avatar/?d=mp';

      // 2. Guardar en base de datos
      await ProfileRepository.update(user.id, {
        fullname: fullname.trim() || null,
        username: sanitizedUsername,
        bio: bio.trim() || null,
        profile_pic_url: finalAvatar,
      });

      // 3. Sincronizar en metadatos de Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: sanitizedUsername,
          fullname: fullname.trim(),
          full_name: fullname.trim(),
          profile_pic_url: finalAvatar
        }
      });

      if (authError) throw authError;

      Alert.alert('¡Éxito!', 'Tu perfil ha sido actualizado correctamente.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      Alert.alert('Error al guardar', error.message || 'Ocurrió un problema guardando los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const modalStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    dismissArea: {
      flex: 1,
    },
    sheetContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 36,
      alignItems: 'center',
    },
    dragIndicator: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border + '40',
      marginBottom: 16,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      fontFamily: 'PlusJakartaSans-Bold',
      marginBottom: 6,
    },
    sheetSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'PlusJakartaSans-Medium',
      marginBottom: 20,
    },
    optionsContainer: {
      width: '100%',
      gap: 12,
    },
    optionBtn: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    optionIcon: {
      marginRight: 10,
    },
    optionText: {
      color: colors.canvasPure,
      fontSize: 15,
      fontWeight: '600',
      fontFamily: 'PlusJakartaSans-SemiBold',
    },
    cancelBtn: {
      backgroundColor: colors.border + '20',
      marginTop: 8,
    },
    cancelBtnText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
      fontFamily: 'PlusJakartaSans-SemiBold',
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary, fontFamily: 'PlusJakartaSans-Medium' }}>
            Cargando perfil...
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity 
              style={styles.avatarContainer} 
              activeOpacity={0.8}
              onPress={handleSelectAvatarSource}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={50} color={colors.placeholder} />
              )}
              <View style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={18} color={colors.canvasPure} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre Completo</Text>
              <TextInput
                style={styles.input}
                value={fullname}
                onChangeText={setFullname}
                placeholder="Ingresa tu nombre"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de Usuario</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Ej: birdwatcher_99"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Correo Electrónico (Solo Lectura)</Text>
              <TextInput
                style={[styles.input, { opacity: 0.6, backgroundColor: colors.componentBase }]}
                value={email}
                editable={false}
                placeholder="Tu correo electrónico"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Biografía</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                value={bio}
                onChangeText={setBio}
                multiline
                placeholder="Cuéntanos un poco sobre ti..."
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveBtnText}>
                {isSaving ? "Guardando cambios..." : "Guardar Cambios"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelBtn} 
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
              disabled={isSaving}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      )}

      {/* Selector de Avatar Custom Modal */}
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
          
          <Animated.View 
            style={[modalStyles.sheetContainer, { transform: [{ translateY: panY }] }]}
          >
            {/* Indicador de barra de arrastre enfocado para capturar el toque */}
            <View {...panResponder.panHandlers} style={{ width: '100%', alignItems: 'center', paddingVertical: 15, marginTop: -10 }}>
              <View style={modalStyles.dragIndicator} />
            </View>
            
            <Text style={modalStyles.sheetTitle}>Cambiar foto de perfil</Text>
            <Text style={modalStyles.sheetSubtitle}>Selecciona cómo quieres actualizar tu foto:</Text>

            <View style={modalStyles.optionsContainer}>
              <TouchableOpacity 
                style={[modalStyles.optionBtn, { backgroundColor: colors.primary }]} 
                activeOpacity={0.85}
                onPress={() => {
                  setModalVisible(false);
                  pickAndUploadImage('camera');
                }}
              >
                <Ionicons name="camera" size={20} color={colors.canvasPure} style={modalStyles.optionIcon} />
                <Text style={modalStyles.optionText}>Tomar Foto con Cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[modalStyles.optionBtn, { backgroundColor: colors.primary }]} 
                activeOpacity={0.85}
                onPress={() => {
                  setModalVisible(false);
                  pickAndUploadImage('gallery');
                }}
              >
                <Ionicons name="images" size={20} color={colors.canvasPure} style={modalStyles.optionIcon} />
                <Text style={modalStyles.optionText}>Seleccionar de Galería</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[modalStyles.optionBtn, { backgroundColor: colors.primary + '12', borderWidth: 1.5, borderColor: colors.primary }]} 
                activeOpacity={0.85}
                onPress={() => {
                  setModalVisible(false);
                  setAvatar('https://gravatar.com/avatar/?d=mp');
                }}
              >
                <Ionicons name="trash-outline" size={20} color={colors.primary} style={modalStyles.optionIcon} />
                <Text style={[modalStyles.optionText, { color: colors.primary }]}>Sin Foto (Quitar avatar)</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

