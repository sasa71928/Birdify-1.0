export function getFirstImageUrl(
  photoUrl: string | string[] | null | undefined,
  fallback: string = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400'
): string {
  if (!photoUrl) return fallback;

  if (Array.isArray(photoUrl)) {
    return photoUrl[0] || fallback;
  }

  if (typeof photoUrl === 'string') {
    try {
      const parsed = JSON.parse(photoUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0] || fallback;
      }
    } catch {
      // It's a plain string URL
    }
    return photoUrl;
  }

  return fallback;
}

export function getAllImageUrls(
  photoUrl: string | string[] | null | undefined,
  fallback: string = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600'
): string[] {
  if (!photoUrl) return [fallback];

  if (Array.isArray(photoUrl)) {
    const valid = photoUrl.filter((u) => typeof u === 'string' && u.trim() !== '');
    return valid.length > 0 ? valid : [fallback];
  }

  if (typeof photoUrl === 'string') {
    const trimmed = photoUrl.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((u) => typeof u === 'string' && u.trim() !== '');
          if (valid.length > 0) return valid;
        }
      } catch {
        // Fallback a URL individual
      }
    }
    return [trimmed];
  }

  return [fallback];
}

