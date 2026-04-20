import React, { useState, useEffect, useRef } from "react";
import "./NotificationBell.css";
import notificationService from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
const TYPE_CFG = {
  BOOKING_APPROVED: { label: "Booking Approved", accent: "#10b981", bg: "#f0fdf4", icon: "✓" },
  BOOKING_REJECTED: { label: "Booking Rejected", accent: "#ef4444", bg: "#fef2f2", icon: "✕" },
  TICKET_UPDATED:   { label: "Ticket Updated",   accent: "#3b82f6", bg: "#eff6ff", icon: "↻" },
  NEW_COMMENT:      { label: "New Comment",       accent: "#f59e0b", bg: "#fffbeb", icon: "💬" },
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

function NotificationBell() {
  const { user } = useAuth();
  const CURRENT_USER_ID = user?.id;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [open,          setOpen]          = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [filter,        setFilter]        = useState("ALL");
  const [shake,         setShake]         = useState(false);
  const [toastNotif,    setToastNotif]    = useState(null);
  
  const panelRef  = useRef(null);
  const prevCount = useRef(0);

  // Poll unread count
  useEffect(() => {
    if (!CURRENT_USER_ID) return;
    fetchUnreadCount();
    const t = setInterval(fetchUnreadCount, 5000); // Polling every 5s for snappy toast experience
    return () => clearInterval(t);
  }, [CURRENT_USER_ID]);

  // Bell shake on new notification + Toast Popup
  useEffect(() => {
    if (unreadCount > prevCount.current && prevCount.current !== 0) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      
      if (CURRENT_USER_ID) {
        notificationService.getAll(CURRENT_USER_ID).then(res => {
          const latest = res.data[0];
          if (latest && !latest.isRead) {
            setToastNotif(latest);
            setTimeout(() => setToastNotif(null), 5000);
          }
        }).catch(err => console.error(err));
      }
    }
    prevCount.current = unreadCount;
  }, [unreadCount, CURRENT_USER_ID]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchUnreadCount = async () => {
    if (!CURRENT_USER_ID) return;
    try {
      const res = await notificationService.getUnreadCount(CURRENT_USER_ID);
      setUnreadCount(res.data.count);
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    if (!CURRENT_USER_ID) return;
    setLoading(true);
    try {
      const res = await notificationService.getAll(CURRENT_USER_ID);
      setNotifications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleBell = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications();
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(CURRENT_USER_ID);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "ALL")    return true;
    if (filter === "UNREAD") return !n.isRead;
    return n.type === filter;
  });

  return (
    <div className="bell-wrap" ref={panelRef}>

      {/* Bell button */}
      <button className={`bell-btn${shake ? " shake" : ""}`} onClick={handleBell} title="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="bell-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="bell-panel">

          {/* Header */}
          <div className="panel-header">
            <div className="panel-header-top">
              <div>
                <span className="panel-title">Notifications</span>
                {unreadCount > 0 && (
                  <span className="panel-new-badge">{unreadCount} new</span>
                )}
              </div>
              <div className="panel-actions">
                {unreadCount > 0 && (
                  <button className="hbtn hbtn-blue" onClick={handleMarkAllRead}>Mark all read</button>
                )}
                <button className="hbtn hbtn-ghost" onClick={() => setOpen(false)}>✕</button>
              </div>
            </div>

            {/* Filter chips */}
            <div className="chip-row">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`chip${filter === f ? " active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="notif-scroll">
            {loading ? (
              <div className="empty-state">
                <div className="spinner" />
                <p className="empty-text" style={{ marginTop: 10 }}>Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔕</div>
                <p className="empty-text">No notifications</p>
              </div>
            ) : (
              filtered.map((n) => {
                const cfg = TYPE_CFG[n.type] || { label: n.type, accent: "#6b7280", bg: "#f9fafb", icon: "•" };
                const unread = !n.isRead;
                return (
                  <div
                    key={n.id}
                    className={`notif-item${unread ? "" : " read"}`}
                    style={{ backgroundColor: unread ? cfg.bg : "#fff" }}
                    onClick={() => unread && handleMarkAsRead(n.id)}
                  >
                    {unread && <div className="accent-bar" style={{ backgroundColor: cfg.accent }} />}
                    <div className="notif-icon" style={{ backgroundColor: cfg.accent + "22", color: cfg.accent }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span className="notif-type-label" style={{ color: cfg.accent }}>{cfg.label}</span>
                        <span className="notif-time">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="notif-msg" style={{ color: unread ? "#1e293b" : "#64748b", fontWeight: unread ? 500 : 400 }}>
                        {n.message}
                      </p>
                    </div>
                    {unread && <div className="unread-dot" style={{ backgroundColor: cfg.accent }} />}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="panel-footer">
              {notifications.length} total · {unreadCount} unread
            </div>
          )}
        </div>
      )}
      {/* Toast Popup */}
      {toastNotif && (() => {
        const cfg = TYPE_CFG[toastNotif.type] || { label: toastNotif.type, accent: "#6b7280", bg: "#f9fafb", icon: "•" };
        return (
          <div className="toast-popup" style={{ backgroundColor: cfg.bg, borderLeft: `4px solid ${cfg.accent}` }}>
            <div className="toast-icon" style={{ backgroundColor: cfg.accent + "22", color: cfg.accent }}>
              {cfg.icon}
            </div>
            <div className="toast-body">
              <span className="toast-title" style={{ color: cfg.accent }}>{cfg.label}</span>
              <p className="toast-msg">{toastNotif.message}</p>
            </div>
            <button className="toast-close" onClick={() => setToastNotif(null)}>✕</button>
          </div>
        );
      })()}

    </div>
  );
}

export default NotificationBell;
