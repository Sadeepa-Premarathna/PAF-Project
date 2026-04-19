// NotificationBell.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = async () => {
    const res = await axios.get(`/api/notifications/user/${userId}`);
    setNotifications(res.data);
    setUnread(res.data.filter(n => !n.read).length);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    await axios.put(`/api/notifications/${id}/read`);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnread(prev => Math.max(0, prev - 1));
  };

  const typeColor = { BOOKING: "#185FA5", TICKET: "#534AB7", COMMENT: "#3B6D11" };

  return (
    <div style={{ position: "relative" }}>
      {/* Bell Icon */}
      <button onClick={() => setOpen(!open)}
        style={{ background: "none", border: "none", cursor: "pointer",
          fontSize: 22, position: "relative" }}>
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -6,
            background: "red", color: "#fff", borderRadius: "50%",
            width: 18, height: 18, fontSize: 11, display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "110%", width: 320,
          background: "#fff", border: "1px solid #ddd", borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 999, overflow: "hidden"
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee",
            fontWeight: 600, fontSize: 14 }}>
            Notifications ({unread} unread)
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: 16, color: "gray", fontSize: 13 }}>No notifications</p>
          ) : (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {notifications.map(n => (
                <div key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  style={{
                    padding: "10px 16px",
                    background: n.read ? "#fff" : "#f0f6ff",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: n.read ? "default" : "pointer"
                  }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px",
                    borderRadius: 99, marginRight: 8,
                    background: typeColor[n.type] + "22",
                    color: typeColor[n.type]
                  }}>
                    {n.type}
                  </span>
                  <span style={{ fontSize: 13, color: "#222" }}>{n.message}</span>
                  <div style={{ fontSize: 11, color: "gray", marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}