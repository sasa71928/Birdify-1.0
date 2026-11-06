import { Post } from '../../../components/FeedItem';
import { formatTimeAgo } from '../../../i18n';
import { getFirstImageUrl, getAllImageUrls } from './parsePhotoUrls';

export function mapSightingToPost(sighting: any, currentUserId?: string): Post {
  const timeAgoStr = formatTimeAgo(sighting.created_at || sighting.sighting_date);

  const reactionsList = Array.isArray(sighting.reactions) ? sighting.reactions : [];
  const likesCount =
    typeof sighting.likes_count === 'number'
      ? sighting.likes_count
      : reactionsList.length === 1 && typeof reactionsList[0]?.count === 'number'
      ? reactionsList[0].count
      : reactionsList.length;

  const commentsListRaw = Array.isArray(sighting.comments) ? sighting.comments : [];
  const commentsCount =
    typeof sighting.comments_count === 'number'
      ? sighting.comments_count
      : commentsListRaw.length === 1 && typeof commentsListRaw[0]?.count === 'number'
      ? commentsListRaw[0].count
      : commentsListRaw.length;

  const hasLiked =
    typeof sighting.has_liked === 'boolean'
      ? sighting.has_liked
      : currentUserId
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
    comments: commentsCount,
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

