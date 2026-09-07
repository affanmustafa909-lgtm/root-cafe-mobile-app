import type { ExpoConfig, ConfigContext } from 'expo/config';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export default ({ config }: ConfigContext): ExpoConfig => {
  const googleServices =
    process.env.GOOGLE_SERVICES_JSON ||
    (existsSync(join(__dirname, 'google-services.json'))
      ? './google-services.json'
      : undefined);

  return {
    ...config,
    name: 'Roots Café',
    slug: 'roots-cafe',
    version: '1.1.5',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    scheme: 'rootscafe',
    // @ts-expect-error Expo SDK types lag behind config fields
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.rootscafe.customer',
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#000000',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      package: 'com.rootscafe.customer',
      permissions: [
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.VIBRATE',
        'android.permission.WAKE_LOCK',
      ],
      ...(googleServices ? { googleServicesFile: googleServices } : {}),
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-dev-client',
      'expo-secure-store',
      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow Roots Café to access your photos for your profile picture.',
        },
      ],
      [
        'expo-notifications',
        {
          color: '#E02A3A',
          defaultChannel: 'orders',
        },
      ],
      './plugins/withFasterNativeBuilds',
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID || undefined,
      },
    },
  };
};
