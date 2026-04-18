import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './TicketsPage.module.css';

const API_BASE = 'http://localhost:8080';

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#f97316',
  IN_PROGRESS: '#3b82f6',
  RESOLVED: '#22c55e',
  CLOSED: '#64748b',
  REJECTED: '#ef4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  resourceLocation: string;
  createdAt: string;
  commentCount: number;
  imageUrls: string[];
  createdBy: { name: string; email: string };
  assignedTo?: { name: string };
}

export default function TicketsPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setTickets(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = filterStatus === 'ALL' ? tickets : tickets.filter(t => t.status === filterStatus);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Incident Tickets</h1>
          <p className={styles.sub}>Manage and track campus maintenance requests</p>
        </div>
        <button className={styles.createBtn} onClick={() => navigate('/tickets/create')}>
          + New Ticket
        </button>
      </div>

      <div className={styles.filterRow}>
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
          <button
            key={s}
            className={`${styles.filterBtn} ${filterStatus === s ? styles.filterActive : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No tickets found.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(t => (
            <Link key={t.id} to={`/tickets/${t.id}`} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.badge} style={{ background: PRIORITY_COLORS[t.priority] + '22', color: PRIORITY_COLORS[t.priority] }}>
                  {t.priority}
                </span>
                <span className={styles.badge} style={{ background: STATUS_COLORS[t.status] + '22', color: STATUS_COLORS[t.status] }}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{t.title}</h3>
              <p className={styles.cardMeta}>📍 {t.resourceLocation}</p>
              <p className={styles.cardMeta}>🏷️ {t.category.replace('_', ' ')}</p>

              {(user?.role === 'ADMIN' || user?.role === 'STAFF_MEMBER') && (
                <p className={styles.cardMeta}>👤 {t.createdBy?.name}</p>
              )}
              {t.assignedTo && (
                <p className={styles.cardMeta}>🔧 Assigned: {t.assignedTo.name}</p>
              )}

              <div className={styles.cardFooter}>
                <span>{t.imageUrls?.length ?? 0} 🖼️</span>
                <span>{t.commentCount} 💬</span>
                <span className={styles.date}>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
