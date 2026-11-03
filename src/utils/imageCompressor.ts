import * as ImageManipulator from 'expo-image-manipulator';

export type CompressionPreset = 'chat' | 'feed' | 'avatar' | 'thumbnail';

interface PresetConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: ImageManipulator.SaveFormat;
}

const PRESETS: Record<CompressionPreset, PresetConfig> = {
  // Chat: Rápido y liviano (80-160 KB), resolución óptima para visualización en móvil
  chat: {
    maxWidth: 1280,
    maxHeight: 1280,
    quality: 0.72,
    format: ImageManipulator.SaveFormat.JPEG,
  },
  // Feed / Avistamientos: Alta fidelidad para identificación de aves (150-300 KB)
  feed: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.78,
    format: ImageManipulator.SaveFormat.JPEG,
  },
  // Perfil / Avatares: Cuadrado compacto (30-60 KB)
  avatar: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.80,
    format: ImageManipulator.SaveFormat.JPEG,
  },
  // Miniaturas
  thumbnail: {
    maxWidth: 256,
    maxHeight: 256,
    quality: 0.65,
    format: ImageManipulator.SaveFormat.JPEG,
  },
};

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

/**
 * Decodificador nativo de base64 a ArrayBuffer para subidas directas a Supabase Storage
 */
export function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
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
    const b1 = lookup[base64.charCodeAt(i)];
    const b2 = lookup[base64.charCodeAt(i + 1)];
    const b3 = lookup[base64.charCodeAt(i + 2)];
    const b4 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = (b1 << 2) | (b2 >> 4);
    if (p < bufferLength) bytes[p++] = ((b2 & 15) << 4) | (b3 >> 2);
    if (p < bufferLength) bytes[p++] = ((b3 & 3) << 6) | (b4 & 63);
  }
  return arrayBuffer;
}

/**
 * Algoritmo universal de compresión y redimensionado proporcional de imágenes.
 * Reduce drásticamente el peso de fotos capturadas con cámaras de alta resolución (48MP/12MP),
 * acelerando las subidas en un 80-90% y reduciendo el consumo de datos y memoria.
 */
export async function compressImage(
  uri: string,
  preset: CompressionPreset = 'feed',
  customOptions?: Partial<PresetConfig>
): Promise<CompressedImageResult> {
  if (!uri) {
    throw new Error('[imageCompressor] URI inválido.');
  }

  const config: PresetConfig = {
    ...PRESETS[preset],
    ...customOptions,
  };

  try {
    // 1. Ejecutar manipulación con límite de ancho
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: config.maxWidth } }],
      {
        compress: config.quality,
        format: config.format,
        base64: true,
      }
    );

    // Si después de redimensionar el alto sigue excediendo maxHeight, ajustar por alto
    if (result.height > config.maxHeight) {
      const secondPass = await ImageManipulator.manipulateAsync(
        result.uri,
        [{ resize: { height: config.maxHeight } }],
        {
          compress: config.quality,
          format: config.format,
          base64: true,
        }
      );
      return {
        uri: secondPass.uri,
        width: secondPass.width,
        height: secondPass.height,
        base64: secondPass.base64,
      };
    }

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      base64: result.base64,
    };
  } catch (error) {
    console.warn('[imageCompressor] Fallo en la compresión, usando URI original:', error);
    return {
      uri,
      width: config.maxWidth,
      height: Math.round(config.maxWidth * 0.75),
    };
  }
}
