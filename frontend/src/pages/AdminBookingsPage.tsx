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

const STATUS_CONFIG: Record<string, { bg: string, color: string, border: string }> = {
  PENDING: { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.2)' },
  APPROVED: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
  REJECTED: { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'rgba(239, 68, 68, 0.2)' },
  CANCELLED: { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-ghost)', border: 'rgba(255, 255, 255, 0.1)' },
};

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [rejectModal, setRejectModal] = useState<{ id: number } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const authHeaders = { 
    Authorization: `Bearer ${token}`, 
    'Content-Type': 'application/json' 
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/bookings`, { headers: authHeaders });
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string, reason?: string) => {
    try {
      const params = new URLSearchParams({ status });
      if (reason) params.append('reason', reason);
      
      const res = await fetch(`${API}/api/bookings/${id}/status?${params}`, {
        method: 'PUT',
        headers: authHeaders,
      });

      if (res.ok) {
        setRejectModal(null);
        setRejectReason('');
        fetchAll();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    TOTAL: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
    REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
  };

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loading}><div className={styles.spinner} /></div>
    </div>
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/admin')}>
          ← Back to Terminal
        </button>
        <div>
          <h1 className={styles.title}>BOOKING ARCHIVE</h1>
          <p className={styles.subtitle}>System-wide resource allocation & scheduling logs</p>
        </div>
      </header>

      <section className={styles.stats}>
        {Object.entries(stats).map(([k, v]) => (
          <div 
            key={k} 
            className={`${styles.stat} ${filter === (k === 'TOTAL' ? 'ALL' : k) ? styles.statActive : ''}`}
            onClick={() => setFilter(k === 'TOTAL' ? 'ALL' : k)}
          >
            <span className={styles.statNum}>{v}</span>
            <span className={styles.statLabel}>{k} RECORDS</span>
          </div>
        ))}
      </section>

      {filtered.length === 0 ? (
        <div className={styles.empty}>NO RESERVATION RECORDS FOUND</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>IDENTITY / SEQUENCE</th>
                <th>OPERATIVE ID</th>
                <th>OBJECTIVE</th>
                <th>VALIDATION</th>
                <th>EXECUTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    <div className={styles.resourceName}>{b.resourceName || 'UNIDENTIFIED'}</div>
                    <div className={styles.time}>{b.date} • {b.startTime} - {b.endTime}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>ID: {b.userId.toString().substring(0, 8)}...</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-ghost)', textTransform: 'uppercase' }}>{b.attendees} ACCESS POINTS</div>
                  </td>
                  <td>
                    <div className={styles.purpose}>"{b.purpose}"</div>
                  </td>
                  <td>
                    <span className={styles.badge} style={{ 
                      background: STATUS_CONFIG[b.status]?.bg, 
                      color: STATUS_CONFIG[b.status]?.color,
                      border: `1px solid ${STATUS_CONFIG[b.status]?.border}`
                    }}>
                      {b.status}
                    </span>
                    {b.rejectionReason && (
                      <div className={styles.reason}>REF: {b.rejectionReason}</div>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {b.status === 'PENDING' && (
                        <>
                          <button className={styles.approve} onClick={() => updateStatus(b.id, 'APPROVED')}>AUTHORIZE</button>
                          <button className={styles.reject} onClick={() => setRejectModal({ id: b.id })}>REFUSE</button>
                        </>
                      )}
                      {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                        <button className={styles.cancel} onClick={() => updateStatus(b.id, 'CANCELLED')}>REVOKE</button>
                      )}
                      {b.status !== 'PENDING' && b.status !== 'APPROVED' && (
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-ghost)', textTransform: 'uppercase' }}>FINALIZED</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>DENY ACCESS REQUEST #{rejectModal.id}</h3>
            <p>Specify the operational reason for refusing this booking request.</p>
            <textarea
              className={styles.modalTextarea}
              rows={4}
              placeholder="Enter refusal justification..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelModal} onClick={() => setRejectModal(null)}>ABORT</button>
              <button 
                className={styles.confirmReject} 
                disabled={!rejectReason}
                onClick={() => updateStatus(rejectModal.id, 'REJECTED', rejectReason)}
              >
                CONFIRM REFUSAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
