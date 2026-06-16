import { createApiClient } from './createApiClient.js';

const api = createApiClient();

export const getNotifications = (page = 1, limit = 20) =>
  api.get(`/notifications?page=${page}&limit=${limit}`);

export const getUnreadCount = () =>
  api.get('/notifications/unread-count');

export const markAsRead = (id) =>
  api.patch(`/notifications/${id}/read`);

export const markAllAsRead = () =>
  api.patch('/notifications/read-all');
