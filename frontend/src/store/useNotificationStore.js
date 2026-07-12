import { create } from 'zustand';
import { getUnreadCount as fetchUnreadCount } from '../api/notificationApi';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  connected: false,

  setConnected: (connected) => set({ connected }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  setNotifications: (notifications) => set({ notifications }),

  refreshUnreadCount: async () => {
    try {
      const res = await fetchUnreadCount();
      set({ unreadCount: res.data?.data?.count ?? 0 });
    } catch {
      // ignore
    }
  },

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
