import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './BookingsPage.module.css';

const API = import.meta.env.VITE_API_BASE_URL;

interface Resource {
  id: number;
  name: string;
  type: string;
  location: string;
  capacity: number;
  availableFrom: string;
  availableTo: string;
  status: string;
}

interface Booking {
  id: number;
  resourceId: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  attendees: number;
  rejectionReason?: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  CANCELLED: '#6b7280',
};

export default function BookingsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedId = searchParams.get('resourceId');
  const [tab, setTab] = useState<'my' | 'new'>('my');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    resourceId: '',
    resourceName: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '',
  });

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchResources();
    fetchMyBookings();

    // If pre-selected from Resources page
    if (preSelectedId) {
      setTab('new');
      setForm(prev => ({ ...prev, resourceId: preSelectedId }));
    }
  }, [preSelectedId]);

  // Update resourceName automatically once resources list is loaded if we have a preSelectedId
  useEffect(() => {
    if (preSelectedId && resources.length > 0 && !form.resourceName) {
      const found = resources.find(r => String(r.id) === preSelectedId);
      if (found) {
        setForm(prev => ({ ...prev, resourceName: found.name }));
      }
    }
  }, [resources, preSelectedId, form.resourceName]);

  const fetchResources = async () => {
    try {
      const res = await fetch(`${API}/api/v1/resources`, { headers: authHeaders });
      if (res.ok) setResources(await res.json());
    } catch { /* silent */ }
  };

  const fetchMyBookings = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/bookings/user/${user.id}`, { headers: authHeaders });
      if (res.ok) setBookings(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.resourceId || !form.date || !form.startTime || !form.endTime || !form.purpose) {
      setError('All fields are required.'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...form,
          attendees: form.attendees ? parseInt(form.attendees) : null,
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(typeof data === 'string' ? data : data.message || 'Booking failed'); return; }
      setSuccess('Booking request submitted! Status: PENDING ⏳');
      setForm({ resourceId: '', resourceName: '', date: '', startTime: '', endTime: '', purpose: '', attendees: '' });
      fetchMyBookings();
      setTab('my');
    } catch { setError('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const cancelBooking = async (id: number) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await fetch(`${API}/api/bookings/${id}/status?status=CANCELLED`, { method: 'PUT', headers: authHeaders });
      fetchMyBookings();
    } catch { /* silent */ }
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = resources.find(r => String(r.id) === e.target.value);
    setForm(prev => ({
      ...prev,
      resourceId: e.target.value,
      resourceName: selected?.name || '',
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/dashboard')}>← DASHBOARD</button>
        <div>
          <h1 className={styles.title}>RESOURCE <span style={{ color: 'var(--accent)' }}>BOOKINGS</span></h1>
          <p className={styles.subtitle}>Secure your spot in our high-performance campus facilities</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'my' ? styles.active : ''}`} onClick={() => setTab('my')}>
          MY BOOKINGS
        </button>
        <button className={`${styles.tab} ${tab === 'new' ? styles.active : ''}`} onClick={() => setTab('new')}>
          + NEW BOOKING
        </button>
      </div>

      {/* My Bookings Tab */}
      {tab === 'my' && (
        <div className={styles.section}>
          {loading ? (
            <div className={styles.loading}><div className={styles.spinner} /></div>
          ) : bookings.length === 0 ? (
            <div className={styles.empty}>
              <span>📋</span>
              <p>No bookings yet. Create your first booking!</p>
              <button className={styles.tab} style={{ background: 'var(--accent)', color: '#030703' }} onClick={() => setTab('new')}>+ NEW BOOKING</button>
            </div>
          ) : (
            <div className={styles.grid}>
              {bookings.map(b => (
                <div key={b.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.resource}>{b.resourceName || `Resource #${b.resourceId}`}</span>
                    <span className={styles.badge} style={{ borderColor: STATUS_COLORS[b.status], color: STATUS_COLORS[b.status], background: STATUS_COLORS[b.status] + '12' }}>
                      {b.status}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.detail}><b>DATE:</b> {b.date}</div>
                    <div className={styles.detail}><b>TIME:</b> {b.startTime} – {b.endTime}</div>
                    <div className={styles.detail}><b>PURPOSE:</b> {b.purpose}</div>
                    {b.attendees && <div className={styles.detail}><b>ATTENDEES:</b> {b.attendees}</div>}
                    {b.rejectionReason && (
                      <div className={styles.rejection}>REASON: {b.rejectionReason}</div>
                    )}
                  </div>
                  {b.status === 'PENDING' && (
                    <button className={styles.cancelBtn} onClick={() => cancelBooking(b.id)}>CANCEL REQUEST</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Booking Tab */}
      {tab === 'new' && (
        <div className={styles.section}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>NEW BOOKING REQUEST</h2>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>SELECTED RESOURCE</label>
                <select value={form.resourceId} onChange={handleResourceChange} required>
                  <option value="">Select a resource...</option>
                  
                  <optgroup label="LABORATORIES">
                    {resources.filter(r => r.status === 'ACTIVE' && r.type === 'LAB').map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.location}, Capacity: {r.capacity})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="LIBRARY & STUDY ROOMS">
                    {resources.filter(r => r.status === 'ACTIVE' && r.type === 'MEETING_ROOM').map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.location}, Capacity: {r.capacity})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="LECTURE HALLS">
                    {resources.filter(r => r.status === 'ACTIVE' && r.type === 'LECTURE_HALL').map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.location}, Capacity: {r.capacity})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="EQUIPMENT">
                    {resources.filter(r => r.status === 'ACTIVE' && r.type === 'EQUIPMENT').map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.location})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className={styles.field}>
                <label>BOOKING DATE</label>
                <input type="date" min={today} value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>START TIME</label>
                  <input type="time" value={form.startTime}
                    onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} required />
                </div>
                <div className={styles.field}>
                  <label>END TIME</label>
                  <input type="time" value={form.endTime}
                    onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} required />
                </div>
              </div>
              <div className={styles.field}>
                <label>ADDITIONAL PURPOSE</label>
                <textarea rows={3} placeholder="Describe the purpose of this booking..."
                  value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} required />
              </div>
              <div className={styles.field}>
                <label>EXPECTED ATTENDEES</label>
                <input type="number" min="1" placeholder="e.g. 20"
                  value={form.attendees} onChange={e => setForm(p => ({ ...p, attendees: e.target.value }))} />
              </div>
              <button type="submit" className={styles.submit} disabled={submitting}>
                {submitting ? 'PROCESSING...' : 'SUBMIT REQUEST'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
