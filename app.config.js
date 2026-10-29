export default {
  expo: {
    name: 'BirdifyApp',
    slug: 'BirdifyApp',
    version: '1.0.4',
    runtimeVersion: {
      policy: 'appVersion',
    },
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    // Esquema de deep link usado para volver a la app tras el login con Google/Facebook o recuperación de contraseña
    scheme: 'birdify',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#154212',
      android: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#154212',
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sasa.BirdifyApp',
      infoPlist: {
        NSCameraUsageDescription:
          'Birdify utiliza la cámara para capturar fotografías de tus avistamientos de aves.',
        NSPhotoLibraryUsageDescription:
          'Birdify necesita acceso a tu galería para adjuntar fotos de aves, perfil y mensajes.',
        NSPhotoLibraryAddUsageDescription:
          'Birdify guarda imágenes de avistamientos cuando lo solicitas.',
        NSLocationWhenInUseUsageDescription:
          'Birdify utiliza tu ubicación para registrar dónde observaste un ave y mostrar avistamientos cercanos en el mapa.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#154212',
      },
      config: {
        googleMaps: {
          apiKey:
            process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
            process.env.GOOGLE_MAPS_API_KEY ||
            '',
        },
      },
      allowBackup: false,
      usesCleartextTraffic: false,
      predictiveBackGestureEnabled: false,
      package: 'com.jcota_22.BirdifyApp',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-font',
      'expo-notifications',
      'expo-mail-composer',
      'expo-sqlite',
      'expo-secure-store',
      'expo-web-browser',
      'expo-status-bar',
      ['expo-system-ui', { backgroundColor: '#154212' }],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Birdify necesita acceso a tu galería para adjuntar fotos de aves, perfil y mensajes.',
          cameraPermission:
            'Birdify utiliza la cámara para capturar fotografías de tus avistamientos de aves.',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Birdify utiliza tu ubicación para registrar dónde observaste un ave y mostrar avistamientos cercanos en el mapa.',
          locationWhenInUsePermission:
            'Birdify utiliza tu ubicación para registrar dónde observaste un ave y mostrar avistamientos cercanos en el mapa.',
          isIosBackgroundLocationEnabled: false,
          isAndroidBackgroundLocationEnabled: false,
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '95e30ded-a907-41b7-a9fe-597f3035d7b3',
      },
    },
  },
};
