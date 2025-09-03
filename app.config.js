import 'dotenv/config';

export default {
  expo: {
    name: 'bayer-app',
    slug: 'bayer-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.henecito.bayerapp',
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'FOREGROUND_SERVICE' 
      ],
      config: {
        googleMaps: {
          apiKey: 'AIzaSyB0hkZ7jkHBBkTHWvuEzuTwKwHAYr4ImJs',
        },
      },
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Esta app necesita acceder a tu ubicación para ubicarte en el mapa.',
          locationWhenInUsePermission:
            'Esta app necesita acceder a tu ubicación mientras está en uso.'
        },
      ],
    ],
    web: {
      favicon: './assets/favicon.png',
    },
  },
};
