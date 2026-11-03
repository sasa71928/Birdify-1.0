import { supabase } from '../../../lib/supabase';

export const CHAT_IMAGE_PREFIX = 'storage://chat-images/';
export const CHAT_IMAGES_BUCKET = 'chat-images';

function extractStoragePath(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || !rawUrl.startsWith(CHAT_IMAGE_PREFIX)) return null;
  return rawUrl.slice(CHAT_IMAGE_PREFIX.length);
}

/**
 * Resuelve de forma inmediata la URL pública para una imagen de chat.
 * Al ser el bucket 'chat-images' público, no requiere firmas ni tokens temporales;
 * se sirve directamente a través del CDN de Supabase.
 */
export function resolveChatImageUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  const path = extractStoragePath(rawUrl);
  if (!path) return rawUrl; // Ya es una URL http/https o local

  const { data } = supabase.storage.from(CHAT_IMAGES_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

export const signedUrlCache = {
  isChatImage(rawUrl: string | null | undefined): boolean {
    return Boolean(rawUrl && rawUrl.startsWith(CHAT_IMAGE_PREFIX));
  },

  get(rawUrl: string | null | undefined): string | null {
    return resolveChatImageUrl(rawUrl);
  },

  set(_rawUrl: string, _signedUrl: string): void {
    // No-op ya que las URLs públicas son permanentes y no expiran
  },

  invalidate(_rawUrl: string): void {
    // No-op
  },

  async resolveSingle(rawUrl: string | null | undefined): Promise<string | null> {
    return resolveChatImageUrl(rawUrl);
  },

  async resolveBatch(rawUrls: Array<string | null | undefined>): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    for (const raw of rawUrls) {
      if (!raw) continue;
      const resolved = resolveChatImageUrl(raw);
      if (resolved) {
        results.set(raw, resolved);
      }
    }
    return results;
  },

  clear() {
    // No-op
  },
};
