import { apiClient } from "../api/apiClient";

const BASE = "/api/notifications";

const notificationService = {
  // Admin — send notification
  send: (data) =>
    apiClient.post(BASE, data),

  // User — get all
  getAll: (userId) =>
    apiClient.get(BASE, { params: { userId } }),

  // User — unread count
  getUnreadCount: (userId) =>
    apiClient.get(`${BASE}/unread-count`, { params: { userId } }),

  // User — mark one read
  markAsRead: (id) =>
    apiClient.put(`${BASE}/${id}/read`),

  // User — mark all read
  markAllAsRead: (userId) =>
    apiClient.put(`${BASE}/read-all`, null, { params: { userId } }),

  // User — delete all
  deleteAll: (userId) =>
    apiClient.delete(BASE, { params: { userId } }),
};

export default notificationService;