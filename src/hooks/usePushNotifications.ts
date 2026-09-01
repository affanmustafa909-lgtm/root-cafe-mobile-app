import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { notificationApi } from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function areNotificationsEnabled(): Promise<boolean> {
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.notificationsEnabled);
  if (saved === null) return true;
  return saved === 'true';
}

export async function setNotificationsPreference(enabled: boolean) {
  await AsyncStorage.setItem(
    STORAGE_KEYS.notificationsEnabled,
    enabled ? 'true' : 'false',
  );
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const enabled = await areNotificationsEnabled();
  if (!enabled) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Orders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const tokenData = await Notifications.getDevicePushTokenAsync();
  const token = tokenData.data;
  if (typeof token === 'string') {
    await notificationApi.registerToken(token, Platform.OS);
    return token;
  }
  return null;
}

export async function unregisterPushToken(token: string | null) {
  if (!token) return;
  try {
    await notificationApi.removeToken(token);
  } catch {
    /* ignore */
  }
}
