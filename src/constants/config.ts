import { Platform } from 'react-native';

export const STORAGE_KEYS = {
  authToken: 'roots_customer_token',
  cart: 'roots_customer_cart',
  language: 'roots_customer_language',
  notificationsEnabled: 'roots_notifications_enabled',
  welcomeSeen: 'roots_customer_welcome_seen',
  theme: 'roots_customer_theme',
} as const;

function hostForDevice(url: string): string {
  if (Platform.OS !== 'android') return url;
  return url
    .replace('://localhost', '://10.0.2.2')
    .replace('://127.0.0.1', '://10.0.2.2');
}

export const API_URL = hostForDevice(
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
);
export const SOCKET_URL = hostForDevice(
  process.env.EXPO_PUBLIC_SOCKET_URL ?? API_URL,
);

export const LEGAL_URLS = {
  terms: process.env.EXPO_PUBLIC_TERMS_URL ?? '',
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
};
