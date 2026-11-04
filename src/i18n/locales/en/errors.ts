import type { errors as esErrors } from '../es/errors';

export const errors: typeof esErrors = {
  general: 'An unexpected error occurred. Please try again.',
  network: 'No internet connection. Please check your network.',
  permissionDenied: 'Permission denied by user.',
  cameraPermission: 'Permission is required to access the camera.',
  galleryPermission: 'Permission is required to access the photo gallery.',
  locationPermission: 'Location permission is required to position the sighting.',
  sessionExpired: 'Your session has expired. Please log in again.',
};
