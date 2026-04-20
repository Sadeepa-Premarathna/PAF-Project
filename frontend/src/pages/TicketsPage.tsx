import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import staffStyles from './TicketsPage.staff.module.css';

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
  assignedStaffName?: string;
}

export default function TicketsPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/tickets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setTickets(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filteredTickets = filterStatus === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  return (
    <div className={staffStyles.page}>
      {/* Header */}
      <div className={staffStyles.header}>
        <div>
          <h1 className={staffStyles.title}>SUPPORT <span style={{ color: 'var(--accent)' }}>HUB</span></h1>
          <p className={staffStyles.sub}>
            {user?.role === 'STUDENT' 
              ? 'Track your active support requests and maintenance reports' 
              : 'Review and manage incoming facility maintenance tickets'}
          </p>
        </div>
        <button 
          className={staffStyles.createBtn}
          onClick={() => navigate('/tickets/create')}
        >
          + NEW TICKET
        </button>
      </div>

      {/* Filter Row */}
      <div className={staffStyles.filterRow}>
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
          <button
            key={s}
            className={`${staffStyles.filterBtn} ${filterStatus === s ? staffStyles.filterActive : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={staffStyles.grid}>
        {loading ? (
          <div className={staffStyles.empty}>
            <p className={staffStyles.sub}>INITIALIZING GATEWAY...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className={staffStyles.empty}>
            <span className={staffStyles.emptyIcon}>📂</span>
            <p className={staffStyles.sub}>NO TICKETS FOUND MATCHING YOUR CRITERIA</p>
          </div>
        ) : (
          filteredTickets.map(t => (
            <Link key={t.id} to={`/tickets/${t.id}`} className={staffStyles.card}>
              <div className={staffStyles.idBadge}>#{t.id.toString().padStart(4, '0')}</div>
              
              <div 
                className={staffStyles.priorityBadge}
                style={{ 
                  color: PRIORITY_COLORS[t.priority] || 'var(--text-ghost)',
                  borderColor: PRIORITY_COLORS[t.priority] || 'var(--border)'
                }}
              >
                {t.priority}
              </div>

              <div className={staffStyles.ticketInfo}>
                <h3 className={staffStyles.ticketTitle}>{t.title}</h3>
                <span className={staffStyles.ticketSub}>{t.category.replace('_', ' ')} — {t.resourceLocation}</span>
              </div>

              <div 
                className={staffStyles.statusBadge}
                style={{ 
                  color: STATUS_COLORS[t.status] || 'var(--text-ghost)',
                  borderColor: STATUS_COLORS[t.status] || 'var(--border)',
                  background: (STATUS_COLORS[t.status] || 'var(--text-ghost)') + '10'
                }}
              >
                {t.status.replace('_', ' ')}
              </div>

              <div className={staffStyles.metadata}>
                <span>CREATED: {new Date(t.createdAt).toLocaleDateString()}</span>
                {t.assignedStaffName && <span>ASSIGNED: {t.assignedStaffName}</span>}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
