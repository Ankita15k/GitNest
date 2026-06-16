import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { connectSocket, disconnectSocket } from '../services/socket';

export const useNotificationSocket = () => {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const setConnected = useNotificationStore((s) => s.setConnected);
  const refreshUnreadCount = useNotificationStore((s) => s.refreshUnreadCount);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = connectSocket(token);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('notification', (data) => {
      addNotification(data);
    });

    refreshUnreadCount();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('notification');
      disconnectSocket();
      setConnected(false);
    };
  }, [isAuthenticated, token]);
};
