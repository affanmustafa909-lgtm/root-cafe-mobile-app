import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';

/** Live menu sync — works for guests (no auth). Debounced to avoid reload storms. */
export function useMenuSocket() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    const refreshMenu = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ['products'] });
        void queryClient.invalidateQueries({ queryKey: ['categories'] });
        void queryClient.invalidateQueries({ queryKey: ['cake-of-day'] });
      }, 800);
    };

    socket.on('menu.updated', refreshMenu);
    socket.on('product.availability_changed', refreshMenu);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      socket.off('menu.updated', refreshMenu);
      socket.off('product.availability_changed', refreshMenu);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);
}
