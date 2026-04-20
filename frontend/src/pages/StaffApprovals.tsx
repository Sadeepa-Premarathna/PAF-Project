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

const STATUS_CONFIG: Record<string, { bg: string, color: string }> = {
  PENDING: { bg: '#fff7ed', color: '#c2410c' },
  APPROVED: { bg: '#ecfdf5', color: '#047857' },
  REJECTED: { bg: '#fef2f2', color: '#b91c1c' },
  CANCELLED: { bg: '#f8fafc', color: '#475569' },
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
    if (!user?.permissions?.includes('BOOKINGS')) {
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
          <h1>Staff Approval Portal</h1>
          <p className={styles.subtitle}>Review and manage campus resource booking requests</p>
        </div>
        <Link to="/staff" className={styles.backBtn}>
           <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
           Dashboard
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
            <span className={styles.statLabel}>{key} Requests</span>
          </div>
        ))}
      </section>

      <section className={styles.tableSection}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Fetching latest requests...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
             <p style={{ color: '#94a3b8', fontSize: '18px' }}>No booking requests found for the selected filter.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>REQUEST DETAILS</th>
                  <th>USER</th>
                  <th>PURPOSE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className={styles.resourceName}>{b.resourceName || 'Unnamed Resource'}</div>
                      <div className={styles.timeDesc}>{b.date} • {b.startTime} - {b.endTime}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>ID: {b.userId.substring(0, 8)}...</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{b.attendees} Attendees</div>
                    </td>
                    <td className={styles.purpose}>"{b.purpose}"</td>
                    <td>
                      <span 
                        className={styles.badge}
                        style={{ background: STATUS_CONFIG[b.status]?.bg, color: STATUS_CONFIG[b.status]?.color }}
                      >
                        {b.status}
                      </span>
                      {b.rejectionReason && (
                        <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', maxWidth: '150px' }}>
                          Reason: {b.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td>
                      {b.status === 'PENDING' ? (
                        <div className={styles.actions}>
                          <button className={styles.approveBtn} onClick={() => updateStatus(b.id, 'APPROVED')}>Approve</button>
                          <button className={styles.rejectBtn} onClick={() => { setRejectModal({ id: b.id }); setRejectReason(''); }}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Processed</span>
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
            <h3>Reject Request #{rejectModal.id}</h3>
            <p>Please provide a brief explanation for the student regarding this rejection.</p>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="e.g. Facility undergoing maintenance, overlapping booking..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className={styles.modalFooter}>
              <button className={styles.btnSec} onClick={() => setRejectModal(null)}>Cancel</button>
              <button 
                className={styles.btnDanger}
                disabled={!rejectReason.trim()}
                onClick={() => updateStatus(rejectModal.id, 'REJECTED', rejectReason)}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
