import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveChatImageUrl } from '../data/signedUrlCache';

interface ImageViewerProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  imageUrl,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !imageUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Guardia de seguridad: el indicador nunca debe quedarse congelado
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [visible, imageUrl]);

  if (!visible || !imageUrl) return null;

  const targetUri = resolveChatImageUrl(imageUrl) || imageUrl;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <TouchableOpacity
          style={[styles.closeBtn, { top: Math.max(insets.top, 16) + 8 }]}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Cerrar visor de imagen"
        >
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          {Boolean(targetUri) && (
            <Image
              source={{ uri: targetUri }}
              style={styles.image}
              contentFit="contain"
              onLoad={() => setLoading(false)}
              onError={(e) => {
                console.warn('[ImageViewer] Error cargando imagen en grande:', e, targetUri);
                setLoading(false);
              }}
            />
          )}

          {loading && (
            <View style={styles.centerLoading} pointerEvents="none">
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLoading: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
