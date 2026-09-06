import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';

const MENU_KEYS = [
  ['products'],
  ['products-popular'],
  ['categories'],
  ['cake-of-day'],
  ['product'],
  ['settings-app'],
  ['onboarding'],
  ['stamp-card'],
] as const;

/** Live menu sync — guests included. Keeps Home + Detail + banner/slider in sync. */
export function useMenuSocket() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const refreshAll = () => {
      for (const queryKey of MENU_KEYS) {
        void queryClient.invalidateQueries({
          queryKey: [...queryKey],
          refetchType: 'all',
        });
      }
    };

    const scheduleRefresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(refreshAll, 150);
    };

    const onConnect = () => scheduleRefresh();
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') scheduleRefresh();
    };

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 10000,
    });
    socketRef.current = socket;

    socket.on('connect', onConnect);
    socket.on('menu.updated', scheduleRefresh);
    socket.on('product.availability_changed', scheduleRefresh);
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      sub.remove();
      socket.off('connect', onConnect);
      socket.off('menu.updated', scheduleRefresh);
      socket.off('product.availability_changed', scheduleRefresh);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);
}
