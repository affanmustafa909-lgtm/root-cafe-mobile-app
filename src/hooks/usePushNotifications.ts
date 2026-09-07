import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { notificationApi } from '../services/api';

const ORDERS_CHANNEL = 'orders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
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

export async function ensureAndroidChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ORDERS_CHANNEL, {
    name: 'Orders',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  // Fallback channel some OEMs / FCM use by default
  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

async function requestAndroidPostNotifications(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

async function resolvePushToken(): Promise<string | null> {
  const projectId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof projectId === 'string' && projectId.length > 0) {
    try {
      const expo = await Notifications.getExpoPushTokenAsync({ projectId });
      if (typeof expo.data === 'string') return expo.data;
    } catch {
      /* fall through */
    }
  }
  try {
    const native = await Notifications.getDevicePushTokenAsync();
    return typeof native.data === 'string' ? native.data : null;
  } catch {
    return null;
  }
}

/** Immediate system notification (works without FCM when app/process is alive). */
export async function notifyOrderUpdate(order: {
  id?: string;
  orderNumber?: string;
  status?: string;
  notes?: string | null;
}) {
  const enabled = await areNotificationsEnabled();
  if (!enabled) return;

  await ensureAndroidChannels();

  const n = order.orderNumber ?? '';
  const status = order.status ?? '';
  const map: Record<string, { title: string; body: string }> = {
    RECEIVED: {
      title: 'Order received',
      body: `Your order ${n} was received.`,
    },
    PREPARING: {
      title: 'Order preparing',
      body: `Your order ${n} is being prepared.`,
    },
    READY_FOR_PICKUP: {
      title: 'Order ready',
      body: `Your order ${n} is ready for pickup.`,
    },
    COMPLETED: {
      title: 'Order completed',
      body: `Thanks! Order ${n} is complete.`,
    },
    DECLINED: {
      title: 'Order declined',
      body: order.notes?.trim()
        ? `Order ${n}: ${order.notes.trim()}`
        : `Sorry — order ${n} could not be fulfilled.`,
    },
  };
  const msg = map[status] ?? {
    title: 'Order update',
    body: n ? `Order ${n} was updated.` : 'Your order was updated.',
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      data: { orderId: order.id ?? '', status },
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: ORDERS_CHANNEL } : {}),
    },
    trigger: null,
  });
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const enabled = await areNotificationsEnabled();
  if (!enabled) return null;

  await ensureAndroidChannels();

  const androidOk = await requestAndroidPostNotifications();
  if (!androidOk) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const token = await resolvePushToken();
  if (token) {
    try {
      await notificationApi.registerToken(token, Platform.OS);
    } catch {
      /* still return token for local use */
    }
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
