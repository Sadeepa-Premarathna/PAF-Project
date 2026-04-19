import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AdminBookingsPage.module.css';

const API = import.meta.env.VITE_API_BASE_URL;

interface Booking {
  id: number;
  resourceId: string;
  resourceName: string;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  attendees?: number;
  rejectionReason?: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  CANCELLED: '#6b7280',
};

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [rejectModal, setRejectModal] = useState<{ id: number } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/bookings`, { headers: authHeaders });
      if (res.ok) setBookings(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const updateStatus = async (id: number, status: string, reason?: string) => {
    const params = new URLSearchParams({ status });
    if (reason) params.append('reason', reason);
    await fetch(`${API}/api/bookings/${id}/status?${params}`, {
      method: 'PUT', headers: authHeaders,
    });
    setRejectModal(null);
    setRejectReason('');
    fetchAll();
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
    REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/admin')}>← Admin Dashboard</button>
        <div>
          <h1 className={styles.title}>📋 Booking Management</h1>
          <p className={styles.subtitle}>Review and manage all resource booking requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        {Object.entries(counts).map(([key, val]) => (
          <button key={key}
            className={`${styles.stat} ${filter === key ? styles.statActive : ''}`}
            onClick={() => setFilter(key)}>
            <span className={styles.statNum}>{val}</span>
            <span className={styles.statLabel}>{key}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No bookings found.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Resource</th>
                <th>User ID</th>
                <th>Date & Time</th>
                <th>Purpose</th>
                <th>Attendees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>{b.resourceName || `Resource #${b.resourceId}`}</td>
                  <td>User #{b.userId}</td>
                  <td>
                    <div>{b.date}</div>
                    <div className={styles.time}>{b.startTime} – {b.endTime}</div>
                  </td>
                  <td className={styles.purpose}>{b.purpose}</td>
                  <td>{b.attendees ?? '—'}</td>
                  <td>
                    <span className={styles.badge}
                      style={{ background: STATUS_COLORS[b.status] + '22', color: STATUS_COLORS[b.status], border: `1px solid ${STATUS_COLORS[b.status]}` }}>
                      {b.status}
                    </span>
                    {b.rejectionReason && (
                      <div className={styles.reason}>"{b.rejectionReason}"</div>
                    )}
                  </td>
                  <td>
                    {b.status === 'PENDING' && (
                      <div className={styles.actions}>
                        <button className={styles.approve}
                          onClick={() => updateStatus(b.id, 'APPROVED')}>✓ Approve</button>
                        <button className={styles.reject}
                          onClick={() => { setRejectModal({ id: b.id }); setRejectReason(''); }}>✗ Reject</button>
                      </div>
                    )}
                    {b.status === 'APPROVED' && (
                      <button className={styles.cancel}
                        onClick={() => updateStatus(b.id, 'CANCELLED')}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Reject Booking #{rejectModal.id}</h3>
            <p>Please provide a reason for rejection:</p>
            <textarea
              className={styles.modalTextarea}
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelModal} onClick={() => setRejectModal(null)}>Cancel</button>
              <button className={styles.confirmReject}
                onClick={() => updateStatus(rejectModal.id, 'REJECTED', rejectReason)}
                disabled={!rejectReason.trim()}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
