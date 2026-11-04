import { Post } from '../../../components/FeedItem';
import { formatTimeAgo } from '../../../i18n';
import { getFirstImageUrl, getAllImageUrls } from './parsePhotoUrls';

export function mapSightingToPost(sighting: any, currentUserId?: string): Post {
  const timeAgoStr = formatTimeAgo(sighting.created_at || sighting.sighting_date);

  const reactionsList = sighting.reactions || [];
  const likesCount = reactionsList.length;
  const hasLiked = currentUserId
    ? reactionsList.some((r: any) => r.user_id === currentUserId)
    : false;

  const rawUser = sighting.users || sighting.user;
  const userData = Array.isArray(rawUser) ? rawUser[0] : rawUser;

  // Extraer todas las imágenes disponibles para habilitar el carrusel PagerView
  const allImages = getAllImageUrls(sighting.photo_url);
  const imageField =
    allImages.length > 1
      ? allImages
      : allImages[0] || getFirstImageUrl(sighting.photo_url);

  let locationText = 'Ubicación Privada';
  if (!sighting.is_location_private && sighting.latitude && sighting.longitude) {
    locationText = `${sighting.latitude.toFixed(4)}, ${sighting.longitude.toFixed(4)}`;
  }

  return {
    id: sighting.id,
    userId: sighting.user_id,
    username: userData?.username || 'Usuario',
    userAvatar: userData?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
    location: locationText,
    image: imageField,
    tag: sighting.bird?.common_name || 'Ave',
    likes: likesCount,
    comments: sighting.comments ? sighting.comments.length : 0,
    caption: sighting.description || '',
    timeAgo: timeAgoStr,
    isVerified: userData?.is_verified === true,
    commentsList: [],
    hasLiked,
    createdAt: sighting.created_at || sighting.sighting_date,
    latitude: sighting.is_location_private ? undefined : sighting.latitude,
    longitude: sighting.is_location_private ? undefined : sighting.longitude,
  };
}

