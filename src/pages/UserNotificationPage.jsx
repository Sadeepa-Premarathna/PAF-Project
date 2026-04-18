import React, { useState, useEffect } from "react";
import "./UserNotificationPage.css";
import notificationService from "../services/notificationService";

const CURRENT_USER_ID = 1;

const TYPE_CFG = {
  BOOKING_APPROVED: { label: "Booking Approved", accent: "#10b981", bg: "#f0fdf4", icon: "✓" },
  BOOKING_REJECTED: { label: "Booking Rejected", accent: "#ef4444", bg: "#fef2f2", icon: "✕" },
  TICKET_UPDATED:   { label: "Ticket Updated",   accent: "#3b82f6", bg: "#eff6ff", icon: "↻" },
  NEW_COMMENT:      { label: "New Comment",      accent: "#f59e0b", bg: "#fffbeb", icon: "💬" },
};

const FILTERS = ["ALL","UNREAD","BOOKING_APPROVED","BOOKING_REJECTED","TICKET_UPDATED","NEW_COMMENT"];
const FILTER_LABELS = {
  ALL:"All", UNREAD:"Unread", BOOKING_APPROVED:"Approved",
  BOOKING_REJECTED:"Rejected", TICKET_UPDATED:"Tickets", NEW_COMMENT:"Comments",
};

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [filter,        setFilter]        = useState("ALL");
  const [unreadCount,   setUnreadCount]   = useState(0);

  // Auto-fetch on mount — so when admin navigates here, data loads fresh
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll(CURRENT_USER_ID);
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((p) => p.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(CURRENT_USER_ID);
      setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "ALL")    return true;
    if (filter === "UNREAD") return !n.isRead;
    return n.type === filter;
  });

  return (
    <div className="unp-page">
      <div className="unp-header">
        <span className="unp-role-badge">USER</span>
        <h2 className="unp-heading">
          My Notifications
          {unreadCount > 0 && (
            <span className="unp-unread-badge">{unreadCount}</span>
          )}
        </h2>
        <p className="unp-sub">
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
            : "All caught up!"}
        </p>
      </div>

      {/* Toolbar */}
      <div className="unp-toolbar">
        <div className="unp-chip-row">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`unp-chip${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
              {f === "UNREAD" && unreadCount > 0 && (
                <span className="unp-chip-count">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {unreadCount > 0 && (
            <button className="unp-btn unp-btn-primary" onClick={handleMarkAllRead}>
              ✓ Mark all read
            </button>
          )}
          <button className="unp-btn unp-btn-outline" onClick={fetchAll}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="unp-empty-box">
          <div className="unp-spinner" />
          <p className="unp-empty-text">Loading notifications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="unp-empty-box">
          <div className="unp-empty-icon">🔕</div>
          <p className="unp-empty-text">
            No {filter === "ALL" ? "" : FILTER_LABELS[filter].toLowerCase() + " "}notifications found.
          </p>
        </div>
      ) : (
        <div className="unp-notif-list">
          {filtered.map((n) => {
            const cfg = TYPE_CFG[n.type] || { label: n.type, accent: "#6b7280", bg: "#f9fafb", icon: "•" };
            const unread = !n.isRead;
            return (
              <div
                key={n.id}
                className={`unp-notif-card${unread ? " unread" : ""}`}
                style={{
                  backgroundColor: unread ? cfg.bg : "#fff",
                  borderLeftColor: unread ? cfg.accent : "#e2e8f0",
                }}
                onClick={() => unread && handleMarkAsRead(n.id)}
              >
                <div className="unp-notif-icon" style={{ background: cfg.accent + "22", color: cfg.accent }}>
                  {cfg.icon}
                </div>
                <div className="unp-notif-body">
                  <div className="unp-notif-type" style={{ color: cfg.accent }}>{cfg.label}</div>
                  <p className="unp-notif-msg" style={{ fontWeight: unread ? 500 : 400, color: unread ? "#1e293b" : "#64748b" }}>
                    {n.message}
                  </p>
                  <span className="unp-notif-time">{timeAgo(n.createdAt)}</span>
                </div>
                {unread && <div className="unp-notif-dot" style={{ background: cfg.accent }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
