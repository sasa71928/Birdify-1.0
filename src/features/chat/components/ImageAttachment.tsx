import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Typography } from '../../../theme';
import { resolveChatImageUrl } from '../data/signedUrlCache';
import { ImageSkeleton } from './ImageSkeleton';

interface ImageAttachmentProps {
  imagePath?: string | null;
  localUri?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  isUploading?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_WIDTH = Math.min(250, Math.floor(SCREEN_WIDTH * 0.66));
const MAX_HEIGHT = 280;
const MIN_WIDTH = 160;
const MIN_HEIGHT = 120;

function isValidRenderUri(uri?: string | null): boolean {
  if (!uri) return false;
  return (
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('data:')
  );
}

export const ImageAttachment: React.FC<ImageAttachmentProps> = React.memo(
  ({
    imagePath,
    localUri,
    imageWidth,
    imageHeight,
    isUploading = false,
    onPress,
    onLongPress,
  }) => {
    const [loadedUris, setLoadedUris] = useState<Record<string, boolean>>({});
    const [failedUris, setFailedUris] = useState<Record<string, boolean>>({});

    // 1. Determinar la URL remota resuelta
    const resolvedRemote = imagePath ? resolveChatImageUrl(imagePath) : null;

    // 2. Determinar las URIs válidas candidatas
    const validLocal =
      localUri && isValidRenderUri(localUri) && !failedUris[localUri] ? localUri : null;
    const validRemote =
      resolvedRemote && isValidRenderUri(resolvedRemote) && !failedUris[resolvedRemote]
        ? resolvedRemote
        : null;

    // URI preferente para dibujar: preferir localUri mientras se envía, o validRemote una vez confirmado
    const activeUri = validRemote || validLocal;

    // La imagen se considera visible si CUALQUIERA de sus fuentes válidas ya se cargó exitosamente
    // Esto evita que al confirmarse la subida se tape la foto con un skeleton
    const isImageVisible = Boolean(
      (validLocal && loadedUris[validLocal]) ||
      (validRemote && loadedUris[validRemote]) ||
      (activeUri && loadedUris[activeUri])
    );

    const isCompletelyFailed = Boolean(
      !validLocal && !validRemote && (localUri || imagePath)
    );

    const showSkeleton = !isImageVisible && !isCompletelyFailed;

    // Calcular dimensiones proporcionales
    let width = MAX_WIDTH;
    let height = Math.round(MAX_WIDTH * 0.75);

    if (imageWidth && imageHeight && imageWidth > 0 && imageHeight > 0) {
      const aspectRatio = imageWidth / imageHeight;
      if (aspectRatio >= 1) {
        width = MAX_WIDTH;
        height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(MAX_WIDTH / aspectRatio)));
      } else {
        height = MAX_HEIGHT;
        width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.round(MAX_HEIGHT * aspectRatio)));
      }
    }

    const handleRetry = () => {
      setFailedUris({});
    };

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        disabled={isUploading || !onPress || isCompletelyFailed}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={220}
        style={[styles.container, { width, height }]}
      >
        {/* Skeleton mientras ninguna fuente ha completado su carga */}
        {showSkeleton && (
          <View style={StyleSheet.absoluteFill}>
            <ImageSkeleton width={width} height={height} borderRadius={Radius.md} />
          </View>
        )}

        {/* Imagen real */}
        {Boolean(activeUri) && !isCompletelyFailed && (
          <Image
            source={{ uri: activeUri! }}
            style={[
              {
                width,
                height,
                borderRadius: Radius.md,
              },
              !isImageVisible && styles.invisibleImage,
            ]}
            resizeMode="cover"
            onLoad={() => {
              if (activeUri) {
                setLoadedUris((prev) => ({ ...prev, [activeUri]: true }));
              }
            }}
            onError={() => {
              if (activeUri) {
                setFailedUris((prev) => ({ ...prev, [activeUri]: true }));
              }
            }}
          />
        )}

        {/* Placeholder de error si fallan todas las fuentes */}
        {isCompletelyFailed && (
          <View style={[styles.errorContainer, { width, height }]}>
            <Ionicons name="alert-circle-outline" size={30} color="#FFFFFF" style={{ opacity: 0.9 }} />
            <Text style={styles.errorText}>No se pudo cargar la imagen</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.75}>
              <Ionicons name="refresh-outline" size={14} color="#FFFFFF" />
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Indicador de subida */}
        {isUploading && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    maxWidth: '100%',
  },
  invisibleImage: {
    opacity: 0,
    position: 'absolute',
  },
  errorContainer: {
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.9,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontFamily: Typography.fontFamilyBody,
    fontWeight: '600',
  },
  uploadOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
