import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';
import { getToken } from '../services/api';

export function useOrderSocket(enabled = true) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      const token = await getToken();
      if (!token || cancelled) return;

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('orders:subscribe');
      });
      socket.on('disconnect', () => setConnected(false));

      const invalidate = (payload?: { id?: string }) => {
        void queryClient.invalidateQueries({ queryKey: ['orders'] });
        void queryClient.invalidateQueries({ queryKey: ['stamp-card'] });
        if (payload?.id) {
          void queryClient.invalidateQueries({ queryKey: ['order', payload.id] });
        } else {
          void queryClient.invalidateQueries({ queryKey: ['order'] });
        }
      };

      socket.on('order.status_changed', invalidate);
      socket.on('order.updated', invalidate);
      socket.on('order.payment_updated', invalidate);
      socket.on('loyalty.stamp_updated', () => {
        void queryClient.invalidateQueries({ queryKey: ['stamp-card'] });
      });
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, queryClient]);

  return { connected };
}
