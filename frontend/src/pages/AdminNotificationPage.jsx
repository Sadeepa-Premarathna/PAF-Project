import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminNotificationPage.module.css";
import notificationService from "../services/notificationService";

const TYPE_OPTIONS = [
  { value: "BOOKING_APPROVED", label: "Booking Authorized", accent: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.2)" },
  { value: "BOOKING_REJECTED", label: "Booking Refused", accent: "#f87171", bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.2)" },
  { value: "TICKET_UPDATED",   label: "Signal Updated",   accent: "#60a5fa", bg: "rgba(96, 165, 250, 0.1)", border: "rgba(96, 165, 250, 0.2)" },
  { value: "NEW_COMMENT",      label: "Comms Entry",      accent: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.2)" },
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
    if (!form.userId || form.userId.trim().length === 0)
      e.userId = "Identification required.";
    if (!form.message.trim())
      e.message = "Payload cannot be empty.";
    else if (form.message.trim().length < 5)
      e.message = "Min 5 characters required.";
    else if (form.message.trim().length > 500)
      e.message = "Overflow: Max 500 characters.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
    setAlert(null);
  };

  const handleSend = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSending(true); setAlert(null);
    try {
      const res = await notificationService.send({
        userId:      form.userId.trim(),
        type:        form.type,
        message:     form.message.trim(),
        referenceId: form.referenceId ? form.referenceId.trim() : null,
      });
      setSent((p) => [res.data, ...p].slice(0, 10));
      setAlert({ type: "success", msg: `Signal transmitted to Identity ${form.userId}.` });
      setForm(INIT);
      setErrors({});
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.message || "Transmission failed." });
    } finally { setSending(false); }
  };

  const handleSendAndView = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSending(true); setAlert(null);
    try {
      await notificationService.send({
        userId:      form.userId.trim(),
        type:        form.type,
        message:     form.message.trim(),
        referenceId: form.referenceId ? form.referenceId.trim() : null,
      });
      navigate("/notifications");
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.message || "Transmission failed." });
      setSending(false);
    }
  };

  const handleClear = () => { setForm(INIT); setErrors({}); setAlert(null); };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.roleBadge}>CORE ADMIN</span>
        <h2 className={styles.heading}>BROADCAST SIGNAL</h2>
        <p className={styles.sub}>Direct neural transmission to campus identity nodes.</p>
      </div>

      {alert && (
        <div className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          {alert.type === "success" ? "✓" : "✕"} {alert.msg}
        </div>
      )}

      <div className={styles.card}>
        <p className={styles.cardTitle}>TRANSMISSION PARAMETERS</p>

        <div className={styles.formGroup}>
          <label className={styles.label}>SIGNAL TYPE</label>
          <div className={styles.typeRow}>
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t.value}
                className={`${styles.typePill} ${form.type === t.value ? styles.active : ""}`}
                style={{
                  borderColor:     t.accent,
                  color:           form.type === t.value ? "#030703" : t.accent,
                  backgroundColor: form.type === t.value ? t.accent : "transparent",
                  boxShadow:       form.type === t.value ? `0 0 15px ${t.accent}44` : "none"
                }}
                onClick={() => setForm((p) => ({ ...p, type: t.value }))}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>TARGET IDENTITY ID</label>
            <input
              className={`${styles.input} ${errors.userId ? styles.error : ""}`}
              name="userId" type="text" placeholder="e.g. 1"
              value={form.userId} onChange={handleChange}
            />
            {errors.userId && <p className={styles.fieldError}>{errors.userId}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              REF KEY <span className={styles.optional}>(OPTIONAL)</span>
            </label>
            <input
              className={`${styles.input} ${errors.referenceId ? styles.error : ""}`}
              name="referenceId" type="text" placeholder="BOOKING / SIGNAL ID"
              value={form.referenceId} onChange={handleChange}
            />
            {errors.referenceId && <p className={styles.fieldError}>{errors.referenceId}</p>}
          </div>

          <div className={`${styles.formGroup} ${styles.full}`}>
            <label className={styles.label}>PAYLOAD MESSAGE</label>
            <textarea
              className={`${styles.textarea} ${errors.message ? styles.error : ""}`}
              name="message" rows={4}
              placeholder="Enter neural payload..."
              value={form.message} onChange={handleChange}
            />
            <p className={styles.char}>{form.message.length} / 500 BITS</p>
            {errors.message && <p className={styles.fieldError}>{errors.message}</p>}
          </div>
        </div>

        {form.message.trim() && selectedType && (
          <div className={styles.preview} style={{ borderLeftColor: selectedType.accent, background: `${selectedType.accent}11` }}>
            <p className={styles.previewLabel} style={{ color: selectedType.accent }}>
              TRANSMISSION PREVIEW — {selectedType.label}
            </p>
            <p className={styles.previewMsg}>{form.message}</p>
          </div>
        )}

        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSend} disabled={sending}>
            {sending ? "TRANSMITTING..." : "EXECUTE SEND"}
          </button>
          <button className={`${styles.btn} ${styles.btnTeal}`} onClick={handleSendAndView} disabled={sending}>
            {sending ? "TRANSMITTING..." : "EXECUTE & VERIFY →"}
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleClear}>RESET CONSOLE</button>
        </div>
      </div>

      {sent.length > 0 && (
        <div className={`${styles.card} ${styles.recentSent}`}>
          <p className={styles.cardTitle}>SIGNAL LOGS (RECENT)</p>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr><th>IDENTITY</th><th>PROTOCOL</th><th>PAYLOAD</th><th>TIMESTAMP</th></tr>
              </thead>
              <tbody>
                {sent.map((n) => {
                  const cfg = TYPE_OPTIONS.find((t) => t.value === n.type) || {};
                  return (
                    <tr key={n.id}>
                      <td style={{ fontWeight: 800, color: 'var(--accent)' }}>ID: {n.userId}</td>
                      <td>
                        <span className={styles.typeBadge} style={{ background: `${cfg.accent}11`, color: cfg.accent, borderColor: `${cfg.accent}33` }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className={styles.msgCell}>{n.message}</td>
                      <td className={styles.timeCell}>{new Date(n.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
