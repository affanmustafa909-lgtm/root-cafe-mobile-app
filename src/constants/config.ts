import { Platform } from 'react-native';

export const STORAGE_KEYS = {
  authToken: 'roots_customer_token',
  cart: 'roots_customer_cart',
  language: 'roots_customer_language',
  notificationsEnabled: 'roots_notifications_enabled',
  welcomeSeen: 'roots_customer_welcome_seen',
  theme: 'roots_customer_theme',
} as const;

/** Bump when cover / onboarding slides change so users see Get Started again once. */
export const WELCOME_VERSION = '3';

const LIVE_API =
  'https://backend-root-cafe-main-production.up.railway.app';

function isLocalHost(url: string): boolean {
  return /:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:|\/|$)/i.test(url);
}

/** Release / store builds always use the live API — never a local machine. */
function resolveApiUrl(raw: string | undefined): string {
  const candidate = (raw ?? '').trim();
  if (!candidate) return LIVE_API;
  if (!__DEV__ && isLocalHost(candidate)) return LIVE_API;
  return candidate;
}

function hostForDevice(url: string): string {
  if (Platform.OS !== 'android') return url;
  // Emulator loopback helpers — never rewrite the live Railway host.
  if (url.includes('railway.app') || url.startsWith('https://')) return url;
  return url
    .replace('://localhost', '://10.0.2.2')
    .replace('://127.0.0.1', '://10.0.2.2');
}

export const API_URL = hostForDevice(
  resolveApiUrl(process.env.EXPO_PUBLIC_API_URL),
);
export const SOCKET_URL = hostForDevice(
  resolveApiUrl(
    process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_URL,
  ),
);

export const LEGAL_URLS = {
  terms: process.env.EXPO_PUBLIC_TERMS_URL ?? '',
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
};
