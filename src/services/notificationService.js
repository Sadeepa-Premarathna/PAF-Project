import axios from "axios";

const BASE = "http://localhost:8080/api/notifications";

const notificationService = {
  // Admin — send notification
  send: (data) =>
    axios.post(BASE, data),

  // User — get all
  getAll: (userId) =>
    axios.get(BASE, { params: { userId } }),

  // User — unread count
  getUnreadCount: (userId) =>
    axios.get(`${BASE}/unread-count`, { params: { userId } }),

  // User — mark one read
  markAsRead: (id) =>
    axios.put(`${BASE}/${id}/read`),

  // User — mark all read
  markAllAsRead: (userId) =>
    axios.put(`${BASE}/read-all`, null, { params: { userId } }),

  // User — delete all
  deleteAll: (userId) =>
    axios.delete(BASE, { params: { userId } }),
};

export default notificationService;