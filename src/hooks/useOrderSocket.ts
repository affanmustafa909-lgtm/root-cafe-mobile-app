import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';
import { getToken } from '../services/api';
import { notifyOrderUpdate } from './usePushNotifications';

type OrderPayload = {
  id?: string;
  orderNumber?: string;
  status?: string;
  notes?: string | null;
};

export function useOrderSocket(enabled = true) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const lastNotified = useRef<Map<string, string>>(new Map());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let removeAppState: (() => void) | undefined;

    const maybeNotify = (payload?: OrderPayload) => {
      if (!payload?.id || !payload.status) return;
      const prev = lastNotified.current.get(payload.id);
      const key = `${payload.status}:${payload.notes ?? ''}`;
      if (prev === key) return;
      lastNotified.current.set(payload.id, key);
      void notifyOrderUpdate(payload);
    };

    (async () => {
      const token = await getToken();
      if (!token || cancelled) return;

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('orders:subscribe');
      });
      socket.on('disconnect', () => setConnected(false));

      const invalidate = (payload?: OrderPayload) => {
        void queryClient.invalidateQueries({ queryKey: ['orders'] });
        void queryClient.invalidateQueries({ queryKey: ['stamp-card'] });
        if (payload?.id) {
          void queryClient.invalidateQueries({
            queryKey: ['order', payload.id],
          });
        } else {
          void queryClient.invalidateQueries({ queryKey: ['order'] });
        }
      };

      socket.on('order.status_changed', (payload?: OrderPayload) => {
        invalidate(payload);
        maybeNotify(payload);
      });
      socket.on('order.updated', (payload?: OrderPayload) => {
        invalidate(payload);
      });
      socket.on('order.payment_updated', (payload?: OrderPayload) =>
        invalidate(payload),
      );
      socket.on('loyalty.stamp_updated', () => {
        void queryClient.invalidateQueries({ queryKey: ['stamp-card'] });
      });

      const onAppState = (state: AppStateStatus) => {
        if (state === 'active' && socket.connected) {
          socket.emit('orders:subscribe');
        }
      };
      const sub = AppState.addEventListener('change', onAppState);
      removeAppState = () => sub.remove();
    })();

    return () => {
      cancelled = true;
      removeAppState?.();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, queryClient]);

  return { connected };
}
