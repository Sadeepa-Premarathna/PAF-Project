import React, { useState, useEffect, useCallback } from "react";
import styles from "./UserNotificationPage.module.css";
import notificationService from "../services/notificationService";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const TYPE_CFG = {
  BOOKING_APPROVED: { label: "Booking Authorized", accent: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", icon: "✓" },
  BOOKING_REJECTED: { label: "Access Refused", accent: "#f87171", bg: "rgba(239, 68, 68, 0.1)", icon: "✕" },
  TICKET_UPDATED:   { label: "Signal Change",   accent: "#60a5fa", bg: "rgba(96, 165, 250, 0.1)", icon: "⚡" },
  NEW_COMMENT:      { label: "Neural Update",      accent: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", icon: "💬" },
};

const FILTERS = ["ALL","UNREAD","BOOKING_APPROVED","BOOKING_REJECTED","TICKET_UPDATED","NEW_COMMENT"];
const FILTER_LABELS = {
  ALL:"All Logs", UNREAD:"New", BOOKING_APPROVED:"Authorized",
  BOOKING_REJECTED:"Refused", TICKET_UPDATED:"Signals", NEW_COMMENT:"Comms",
};

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "JUST NOW";
  if (m < 60) return `${m}M AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}H AGO`;
  return `${Math.floor(h / 24)}D AGO`;
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
    if (!window.confirm("ARE YOU CERTAIN? SYSTEM LOGS WILL BE PERMANENTLY ERASED.")) return;
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
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.backLink}>← BACK TO NEURAL HUB</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h2 className={styles.heading}>
              SIGNAL ANALYZER
              {unreadCount > 0 && (
                <span className={styles.unreadBadge}>{unreadCount}</span>
              )}
            </h2>
            <p className={styles.sub}>
              {unreadCount > 0
                ? `DETECTION: ${unreadCount} NEW SIGNAL${unreadCount > 1 ? "S" : ""} RECEIVED.`
                : "STATUS: SYSTEMS NOMINAL. ALL SIGNALS ANALYZED."}
            </p>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.chipRow}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.chip} ${filter === f ? styles.active : ""}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
              {f === "UNREAD" && unreadCount > 0 && (
                <span className={styles.chipCount}>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
        <div className={styles.btnGroup}>
          {unreadCount > 0 && (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleMarkAllRead}>
              ✓ ANALYZE ALL
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              className={styles.btn} 
              onClick={handleDeleteAll} 
              style={{ borderColor: "#f87171", color: "#f87171" }}
            >
              PURGE DATA
            </button>
          )}
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={fetchAll}>
            ↻ RESET LINK
          </button>
        </div>
      </div>

      {/* Notification list */}
      {loading ? (
        <div className={styles.emptyBox}>
          <div className={styles.spinner} />
          <p className={styles.emptyText}>SYNCHRONIZING SIGNALS...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyBox}>
          <div className={styles.emptyIcon}>🧬</div>
          <p className={styles.emptyText}>
            NO {filter === "ALL" ? "ACTIVE" : FILTER_LABELS[filter].toUpperCase() + " "}SIGNALS DETECTED.
          </p>
        </div>
      ) : (
        <div className={styles.notifList}>
          {filtered.map((n) => {
            const cfg = TYPE_CFG[n.type] || { label: n.type, accent: "var(--text-ghost)", bg: "var(--bg-card)", icon: "•" };
            const unread = !n.read;
            return (
              <div
                key={n.id}
                className={`${styles.notifCard} ${unread ? styles.unread : ""}`}
                style={{
                  borderLeftColor: unread ? cfg.accent : "var(--border)",
                }}
                onClick={() => unread && handleMarkAsRead(n.id)}
              >
                <div className={styles.notifIcon} style={{ background: `${cfg.accent}22`, color: cfg.accent, border: `1px solid ${cfg.accent}33` }}>
                  {cfg.icon}
                </div>
                <div className={styles.notifBody}>
                  <div className={styles.notifType} style={{ color: cfg.accent }}>{cfg.label}</div>
                  <p className={styles.notifMsg} style={{ color: unread ? "var(--text-main)" : "var(--text-dim)" }}>
                    {n.message}
                  </p>
                  <span className={styles.notifTime}>{timeAgo(n.createdAt)}</span>
                </div>
                {unread && <div className={styles.notifDot} style={{ background: cfg.accent, color: cfg.accent }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
