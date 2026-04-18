import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminNotificationPage.css";
import notificationService from "../services/notificationService";

const TYPE_OPTIONS = [
  { value: "BOOKING_APPROVED", label: "Booking Approved", accent: "#10b981", bg: "#f0fdf4" },
  { value: "BOOKING_REJECTED", label: "Booking Rejected", accent: "#ef4444", bg: "#fef2f2" },
  { value: "TICKET_UPDATED",   label: "Ticket Updated",   accent: "#3b82f6", bg: "#eff6ff" },
  { value: "NEW_COMMENT",      label: "New Comment",      accent: "#f59e0b", bg: "#fffbeb" },
];

const INIT = { userId: "", type: "BOOKING_APPROVED", message: "", referenceId: "" };

export default function AdminNotificationPage() {
  const navigate = useNavigate();

  const [form,    setForm]    = useState(INIT);
  const [errors,  setErrors]  = useState({});
  const [sending, setSending] = useState(false);
  const [alert,   setAlert]   = useState(null);
  const [sent,    setSent]    = useState([]);

  const selectedType = TYPE_OPTIONS.find((t) => t.value === form.type);

  const validate = () => {
    const e = {};
    if (!form.userId || isNaN(form.userId) || Number(form.userId) < 1)
      e.userId = "Valid User ID is required.";
    if (!form.message.trim())
      e.message = "Message cannot be empty.";
    else if (form.message.trim().length < 5)
      e.message = "Min 5 characters required.";
    else if (form.message.trim().length > 500)
      e.message = "Max 500 characters allowed.";
    if (form.referenceId && isNaN(form.referenceId))
      e.referenceId = "Must be a number.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
    setAlert(null);
  };

  // Send only — stay on admin page
  const handleSend = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSending(true); setAlert(null);
    try {
      const res = await notificationService.send({
        userId:      Number(form.userId),
        type:        form.type,
        message:     form.message.trim(),
        referenceId: form.referenceId ? Number(form.referenceId) : null,
      });
      setSent((p) => [res.data, ...p].slice(0, 10));
      setAlert({ type: "success", msg: `Notification sent to User #${form.userId}!` });
      setForm(INIT);
      setErrors({});
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.message || "Failed to send." });
    } finally { setSending(false); }
  };

  // Send and go to user notifications page
  const handleSendAndView = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSending(true); setAlert(null);
    try {
      await notificationService.send({
        userId:      Number(form.userId),
        type:        form.type,
        message:     form.message.trim(),
        referenceId: form.referenceId ? Number(form.referenceId) : null,
      });
      // Navigate to user notifications page
      navigate("/notifications");
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.message || "Failed to send." });
      setSending(false);
    }
  };

  const handleClear = () => { setForm(INIT); setErrors({}); setAlert(null); };

  return (
    <div className="anp-page">
      <div className="anp-header">
        <span className="anp-role-badge">ADMIN</span>
        <h2 className="anp-heading">Send Notification</h2>
        <p className="anp-sub">Send a notification directly to any user.</p>
      </div>

      {alert && (
        <div className={`anp-alert anp-alert-${alert.type}`}>
          {alert.type === "success" ? "✓" : "✕"} {alert.msg}
        </div>
      )}

      <div className="anp-card">
        <p className="anp-card-title">New Notification</p>

        {/* Type pills */}
        <div className="anp-form-group">
          <label className="anp-label">Type</label>
          <div className="anp-type-row">
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t.value}
                className={`anp-type-pill${form.type === t.value ? " active" : ""}`}
                style={{
                  borderColor:     t.accent,
                  color:           form.type === t.value ? "#fff" : t.accent,
                  backgroundColor: form.type === t.value ? t.accent : t.bg,
                }}
                onClick={() => setForm((p) => ({ ...p, type: t.value }))}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="anp-grid">
          <div className="anp-form-group">
            <label className="anp-label">User ID</label>
            <input
              className={`anp-input${errors.userId ? " error" : ""}`}
              name="userId" type="number" placeholder="e.g. 1"
              value={form.userId} onChange={handleChange}
            />
            {errors.userId && <p className="anp-field-error">{errors.userId}</p>}
          </div>

          <div className="anp-form-group">
            <label className="anp-label">
              Reference ID <span className="anp-optional">(optional)</span>
            </label>
            <input
              className={`anp-input${errors.referenceId ? " error" : ""}`}
              name="referenceId" type="number" placeholder="Booking / Ticket ID"
              value={form.referenceId} onChange={handleChange}
            />
            {errors.referenceId && <p className="anp-field-error">{errors.referenceId}</p>}
          </div>

          <div className="anp-form-group anp-full">
            <label className="anp-label">Message</label>
            <textarea
              className={`anp-textarea${errors.message ? " error" : ""}`}
              name="message" rows={4}
              placeholder="Enter the notification message..."
              value={form.message} onChange={handleChange}
            />
            <p className="anp-char">{form.message.length} / 500</p>
            {errors.message && <p className="anp-field-error">{errors.message}</p>}
          </div>
        </div>

        {/* Live preview */}
        {form.message.trim() && selectedType && (
          <div className="anp-preview" style={{ borderLeftColor: selectedType.accent, background: selectedType.bg }}>
            <p className="anp-preview-label" style={{ color: selectedType.accent }}>
              Preview — {selectedType.label}
            </p>
            <p className="anp-preview-msg">{form.message}</p>
          </div>
        )}

        <div className="anp-actions">
          <button className="anp-btn anp-btn-primary" onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
          <button className="anp-btn anp-btn-teal" onClick={handleSendAndView} disabled={sending}>
            {sending ? "Sending..." : "Send & View →"}
          </button>
          <button className="anp-btn anp-btn-outline" onClick={handleClear}>Clear</button>
        </div>
      </div>

      {/* Recently sent */}
      {sent.length > 0 && (
        <div className="anp-card" style={{ marginTop: 20 }}>
          <p className="anp-card-title">Recently Sent</p>
          <table className="anp-table">
            <thead>
              <tr><th>User ID</th><th>Type</th><th>Message</th><th>Time</th></tr>
            </thead>
            <tbody>
              {sent.map((n) => {
                const cfg = TYPE_OPTIONS.find((t) => t.value === n.type) || {};
                return (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600 }}>#{n.userId}</td>
                    <td>
                      <span className="anp-type-badge" style={{ background: cfg.bg, color: cfg.accent }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="anp-msg-cell">{n.message}</td>
                    <td className="anp-time-cell">{new Date(n.createdAt).toLocaleTimeString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
