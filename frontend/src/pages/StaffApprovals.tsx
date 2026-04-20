import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './StaffApprovals.module.css';

const API = import.meta.env.VITE_API_BASE_URL;

interface Booking {
  id: number;
  resourceId: string;
  resourceName: string;
  userId: string;
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

export default function StaffApprovals() {
  const { token, user } = useAuth();
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
    if (user && !user.permissions?.includes('BOOKINGS') && user.role !== 'ADMIN') {
      navigate('/staff');
    } else {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/bookings`, { headers: authHeaders });
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
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
      alert('Failed to update booking status');
    }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    ALL: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
    REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
  };

  return (
    <div className={styles.page}>
      
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>AUTHORIZATION PORTAL</h1>
          <p className={styles.subtitle}>Secure verification and processing of campus resource requests</p>
        </div>
        <Link to="/staff" className={styles.backBtn}>
           <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
           BACK TO HUB
        </Link>
      </header>

      <section className={styles.statsGrid}>
        {Object.entries(stats).map(([key, val]) => (
          <div 
            key={key}
            className={`${styles.statCard} ${filter === key ? styles.active : ''}`}
            onClick={() => setFilter(key)}
          >
            <span className={styles.statVal}>{val}</span>
            <span className={styles.statLabel}>{key} DOMAIN</span>
          </div>
        ))}
      </section>

      <section className={styles.tableSection}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-ghost)' }}>Decrypting request logs...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
             <p style={{ color: 'var(--text-ghost)', fontSize: '18px', fontWeight: 700 }}>NO ENTRIES MATCHING SELECTION</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>RESOURCE IDENTITY</th>
                  <th>USER PROTOCOL</th>
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
                      <div className={styles.timeDesc}>{b.date} • {b.startTime} - {b.endTime}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>ID: {b.userId.toString().substring(0, 8)}...</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-ghost)', textTransform: 'uppercase' }}>{b.attendees} ACCESS POINTS</div>
                    </td>
                    <td className={styles.purpose}>"{b.purpose}"</td>
                    <td>
                      <span 
                        className={styles.badge}
                        style={{ 
                          background: STATUS_CONFIG[b.status]?.bg, 
                          color: STATUS_CONFIG[b.status]?.color,
                          border: `1px solid ${STATUS_CONFIG[b.status]?.border}`
                        }}
                      >
                        {b.status}
                      </span>
                      {b.rejectionReason && (
                        <div style={{ fontSize: '11px', color: '#f87171', marginTop: '6px', maxWidth: '150px', fontWeight: 600 }}>
                          REF: {b.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td>
                      {b.status === 'PENDING' ? (
                        <div className={styles.actions}>
                          <button className={styles.approveBtn} onClick={() => updateStatus(b.id, 'APPROVED')}>AUTHORIZE</button>
                          <button className={styles.rejectBtn} onClick={() => { setRejectModal({ id: b.id }); setRejectReason(''); }}>REFUSE</button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-ghost)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>FINALIZED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reject Modal */}
      {rejectModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>DENY ACCESS REQUEST #{rejectModal.id}</h3>
            <p>Specify the operational reason for refusing this booking request.</p>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="Enter refusal justification..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className={styles.modalFooter}>
              <button className={styles.btnSec} onClick={() => setRejectModal(null)}>ABORT</button>
              <button 
                className={styles.btnDanger}
                disabled={!rejectReason.trim()}
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
