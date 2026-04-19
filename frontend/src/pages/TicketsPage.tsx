import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userStyles from './TicketsPage.user.module.css';
import staffStyles from './TicketsPage.staff.module.css';

const API_BASE = 'http://localhost:8080';

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#f97316', IN_PROGRESS: '#3b82f6', RESOLVED: '#22c55e', CLOSED: '#64748b', REJECTED: '#ef4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444',
};

interface Ticket {
  id: string; title: string; status: string; priority: string; category: string;
  resourceLocation: string; createdAt: string; commentCount: number; imageUrls: string[];
  createdBy: { name: string; email: string }; assignedTo?: { name: string };
}

export default function TicketsPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const isStaff = user?.role === 'STAFF_MEMBER' || user?.role === 'ADMIN';
  const styles = isStaff ? staffStyles : userStyles;

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/tickets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setTickets(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = filterStatus === 'ALL' ? tickets : tickets.filter(t => t.status === filterStatus);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{isStaff ? 'Service Queue' : 'Support Hub'}</h1>
          <p className={styles.sub}>
            {isStaff ? 'Manage and track campus maintenance requests' : 'Track your submitted support tickets'}
          </p>
        </div>
        {!isStaff && (
          <button className={styles.createBtn} onClick={() => navigate('/tickets/create')}>
            + New Ticket
          </button>
        )}
      </header>

      <div className={styles.filterRow}>
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
          <button key={s} className={`${styles.filterBtn} ${filterStatus === s ? styles.filterActive : ''}`}
            onClick={() => setFilterStatus(s)}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No tickets found.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(t => (
            <Link key={t.id} to={`/tickets/${t.id}`} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.badge} style={{ background: STATUS_COLORS[t.status] + '22', color: STATUS_COLORS[t.status] }}>
                  {t.status.replace('_', ' ')}
                </span>
                {isStaff && (
                  <span className={styles.badge} style={{ background: PRIORITY_COLORS[t.priority] + '22', color: PRIORITY_COLORS[t.priority] }}>
                    {t.priority}
                  </span>
                )}
              </div>

              {!isStaff && (
                <span className={styles.badge} style={{ background: PRIORITY_COLORS[t.priority] + '22', color: PRIORITY_COLORS[t.priority], width: 'fit-content', marginBottom: '8px' }}>
                  {t.priority}
                </span>
              )}

              <h3 className={styles.cardTitle}>{t.title}</h3>
              <p className={styles.cardMeta}>📍 {t.resourceLocation}</p>

              {isStaff ? (
                <>
                  <p className={styles.cardMeta}>👤 {t.createdBy?.name}</p>
                  <div className={styles.cardFooter}>
                    <span>{t.commentCount} 💬</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </>
              ) : (
                <div className={styles.cardFooter}>
                  <span>🏷️ {t.category.replace('_', ' ')}</span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
