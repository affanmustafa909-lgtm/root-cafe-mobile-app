import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../../constants/config';

const memory = new Map<string, string>();
const STORE_TIMEOUT_MS = 2500;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    memory.set(key, value);
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
    return;
  }
  memory.set(key, value);
  await withTimeout(SecureStore.setItemAsync(key, value), STORE_TIMEOUT_MS, undefined);
}

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  }
  const cached = memory.get(key);
  const stored = await withTimeout(
    SecureStore.getItemAsync(key),
    STORE_TIMEOUT_MS,
    cached ?? null,
  );
  if (stored != null) memory.set(key, stored);
  return stored ?? cached ?? null;
}

async function deleteItem(key: string) {
  memory.delete(key);
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return;
  }
  await withTimeout(SecureStore.deleteItemAsync(key), STORE_TIMEOUT_MS, undefined);
}

export async function getToken(): Promise<string | null> {
  return getItem(STORAGE_KEYS.authToken);
}

export async function setToken(token: string | null): Promise<void> {
  if (!token) {
    await deleteItem(STORAGE_KEYS.authToken);
    return;
  }
  await setItem(STORAGE_KEYS.authToken, token);
}
