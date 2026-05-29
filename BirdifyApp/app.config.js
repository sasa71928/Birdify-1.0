export default {
  expo: {
    name: 'BirdifyApp',
    slug: 'BirdifyApp',
    version: '1.0.3',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
        },
      },
      newArchEnabled: false,
      edgeToEdgeEnabled: true,
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
    ],
    extra: {
      eas: {
        projectId: '95e30ded-a907-41b7-a9fe-597f3035d7b3',
      },
    },
  },
};
