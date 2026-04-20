import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './AdminDashboard.module.css';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080';

const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const ShieldIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const GridIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const BackIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  active: boolean;
}

export default function StaffManagement() {
  const { user, token } = useAuth();
  const [staffList, setStaffList] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const permissionsList = [
    { id: 'RESOURCES', label: 'Resource Management' },
    { id: 'BOOKINGS', label: 'Booking Management' },
    { id: 'TICKETS', label: 'Support Tickets' },
    { id: 'NOTIFICATIONS', label: 'Campus Notifications' }
  ];

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: AppUser[] = await res.json();
        setStaffList(data.filter(u => u.role === 'STAFF_MEMBER'));
      }
    } catch (err) {
      console.error('Failed to fetch staff', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStaff();
  }, [token]);

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedPermissions.length === 0) {
      setError('Please select at least one permission');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/staff`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          permissions: selectedPermissions
        })
      });

      if (res.ok) {
        setSuccess('Staff member created successfully!');
        setName('');
        setEmail('');
        setPassword('');
        setSelectedPermissions([]);
        setShowForm(false);
        fetchStaff();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create staff member');
      }
    } catch (err) {
      setError('A connection error occurred');
    }
  };

  return (
    <div className={styles.page}>
      
      {/* ─── SIDEBAR ─── */}
      <div className={styles.sidebar}>
        <div className={styles.logo}>SC</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <Link to="/admin" className={styles.navIcon} title="Dashboard"><UserIcon /></Link>
          <Link to="/admin/staff" className={`${styles.navIcon} ${styles.active}`} title="Staff Management"><ShieldIcon /></Link>
          <Link to="/admin/resources" className={styles.navIcon} title="Resources"><GridIcon /></Link>
          <Link to="/admin/bookings" className={styles.navIcon} title="Bookings"><CalendarIcon /></Link>
          <Link to="/admin/notifications" className={styles.navIcon} title="Notifications"><BellIcon /></Link>
        </div>
      </div>

      <div className={styles.mainContainer}>
        
        <header className={styles.header}>
          <div>
            <h1 className={styles.greeting}>STAFF DIRECTORY</h1>
            <p className={styles.subGreeting}>Access control & permission management</p>
          </div>
          <div className={styles.headerRight}>
             <Link to="/admin" className={styles.logoutBtn} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BackIcon /> BACK
             </Link>
             <button className={styles.logoutBtn} onClick={() => setShowForm(!showForm)} style={{ background: 'var(--accent)', color: '#080d08' }}>
                {showForm ? 'CANCEL' : 'REGISTER STAFF'}
             </button>
          </div>
        </header>

        {showForm && (
          <section className={styles.tableSection} style={{ marginBottom: '30px', animation: 'slideDown 0.3s ease-out', border: '1px solid var(--accent)' }}>
            <div className={styles.tableHeader}>
               <h2 className={styles.sectionTitle}>Personnel Enrollment</h2>
            </div>
            <form onSubmit={handleCreateStaff} style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</label>
                    <input 
                        type="text" 
                        className={styles.searchBar} 
                        style={{ width: '100%' }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
                    <input 
                        type="email" 
                        className={styles.searchBar} 
                        style={{ width: '100%' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '1px' }}>Security Access Key (Password)</label>
                    <input 
                        type="password" 
                        className={styles.searchBar} 
                        style={{ width: '100%' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>System Domain Access</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {permissionsList.map(p => (
                            <div 
                                key={p.id}
                                onClick={() => togglePermission(p.id)}
                                style={{ 
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    border: '1.5px solid',
                                    borderColor: selectedPermissions.includes(p.id) ? 'var(--accent)' : 'var(--border)',
                                    background: selectedPermissions.includes(p.id) ? 'var(--accent-ultra)' : 'var(--bg-surface)',
                                    color: selectedPermissions.includes(p.id) ? 'var(--accent)' : 'var(--text-ghost)',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    transition: 'all 0.2s',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {p.label} {selectedPermissions.includes(p.id) && '✓'}
                            </div>
                        ))}
                    </div>
                </div>

                {error && <div style={{ gridColumn: 'span 2', color: '#f87171', fontSize: '13px', fontWeight: 600 }}>⚠ {error}</div>}
                {success && <div style={{ gridColumn: 'span 2', color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>✓ {success}</div>}

                <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '10px' }}>
                    <button type="submit" className={styles.logoutBtn} style={{ background: 'var(--accent)', color: '#080d08', border: 'none', padding: '12px 30px' }}>INITIALIZE ACCOUNT</button>
                </div>
            </form>
          </section>
        )}

        <section className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>ACTIVE PERSONNEL</h2>
            <div style={{ color: 'var(--text-ghost)', fontSize: '12px', fontWeight: 700 }}>{staffList.length} OPERATIVE(S) FOUND</div>
          </div>

          <div className={styles.tableContainer}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-ghost)' }}>Retrieving personnel data...</div>
            ) : staffList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-ghost)' }}>No active personnel found. Register an operative to begin.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>OPERATIVE</th>
                    <th>COMMUNICATION</th>
                    <th>ACCESS PRIVILEGES</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar} style={{ background: 'var(--accent-ultra)', border: '1px solid var(--accent)' }}>
                            {s.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 800 }}>Level Staff</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '13px' }}>{s.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {s.permissions?.map(p => (
                            <span key={p} className={styles.roleTag} style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                              {p}
                            </span>
                          ))}
                          {(!s.permissions || s.permissions.length === 0) && <span style={{ color: 'var(--text-ghost)', fontSize: '12px' }}>NO PRIVILEGES</span>}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: s.active ? 'var(--accent)' : '#f87171', fontSize: '12px' }}>
                          {s.active ? 'OPERATIONAL' : 'DEACTIVATED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </div>

      <style>{`
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );

}
