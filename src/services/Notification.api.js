// Notification.api.js
import api from "./api"; // ton axios mobile (api.js)

export const getUnreadNotifications = async () => {
  const res = await api.get("/notifications/unread");
  return res.data.notifications; // retourne le tableau notifications
};

export const markAsRead = async (id) => {
  const res = await api.post(`/notifications/${id}/read`);
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await api.post("/notifications/read-all");
  return res.data;
};

// Si tu veux récupérer toutes les notifications (lues + non lues)
export const getAllNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data.notifications;
};