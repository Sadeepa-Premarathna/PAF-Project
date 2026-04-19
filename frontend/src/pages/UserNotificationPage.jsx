import React, { useState, useEffect, useCallback } from "react";
import "./UserNotificationPage.css";
import notificationService from "../services/notificationService";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const TYPE_CFG = {
  BOOKING_APPROVED: { label: "Booking Approved", accent: "#f97316", bg: "rgba(249, 115, 22, 0.1)", icon: "📅" },
  BOOKING_REJECTED: { label: "Booking Rejected", accent: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", icon: "✕" },
  TICKET_UPDATED:   { label: "Ticket Updated",   accent: "#1a3d2b", bg: "rgba(26, 61, 43, 0.1)", icon: "🎟️" },
  NEW_COMMENT:      { label: "New Comment",      accent: "#10b981", bg: "rgba(16, 185, 129, 0.1)", icon: "💬" },
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
  const { user } = useAuth();
  const currentUserId = user?.id;
  
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [filter,        setFilter]        = useState("ALL");
  const [unreadCount,   setUnreadCount]   = useState(0);

  const fetchAll = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await notificationService.getAll(currentUserId);
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.read).length);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [currentUserId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(currentUserId);
      setNotifications((p) => p.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) return;
    try {
      await notificationService.deleteAll(currentUserId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "ALL")    return true;
    if (filter === "UNREAD") return !n.read;
    return n.type === filter;
  });

  return (
    <div className="unp-page">
      <div className="unp-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <Link to="/dashboard" className="unp-back-link">← Back to Dashboard</Link>
            <h2 className="unp-heading">
              Notification Hub
              {unreadCount > 0 && (
                <span className="unp-unread-badge">{unreadCount}</span>
              )}
            </h2>
          </div>
        </div>
        <p className="unp-sub">
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
            : "You're all caught up!"}
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
          {notifications.length > 0 && (
            <button 
              className="unp-btn" 
              onClick={handleDeleteAll} 
              style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
            >
              🗑️ Delete All
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
            const unread = !n.read;
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
