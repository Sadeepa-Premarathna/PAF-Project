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
        <div className={styles.logo}>A</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <Link to="/admin" className={styles.navIcon} title="Dashboard"><UserIcon /></Link>
          <Link to="/admin/staff" className={`${styles.navIcon} ${styles.active}`} title="Staff Management"><ShieldIcon /></Link>
        </div>
      </div>

      <div className={styles.mainContainer}>
        
        <header className={styles.header}>
          <div>
            <h1 className={styles.greeting}>Staff Management</h1>
            <p className={styles.subGreeting}>Manage roles and access for campus staff</p>
          </div>
          <div className={styles.headerRight}>
             <Link to="/admin" className={styles.logoutBtn} style={{ background: '#f1f5f9', color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BackIcon /> Back
             </Link>
             <button className={styles.logoutBtn} onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'Add New Staff'}
             </button>
          </div>
        </header>

        {showForm && (
          <section className={styles.tableSection} style={{ marginBottom: '30px', animation: 'slideDown 0.3s ease-out' }}>
            <div className={styles.tableHeader}>
               <h2 className={styles.sectionTitle}>Create Staff Account</h2>
            </div>
            <form onSubmit={handleCreateStaff} style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Full Name</label>
                    <input 
                        type="text" 
                        className={styles.searchBar} 
                        style={{ width: '100%', color: '#0f172a', border: '1px solid #cbd5e1' }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Email Address</label>
                    <input 
                        type="email" 
                        className={styles.searchBar} 
                        style={{ width: '100%', color: '#0f172a', border: '1px solid #cbd5e1' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Password</label>
                    <input 
                        type="password" 
                        className={styles.searchBar} 
                        style={{ width: '100%', color: '#0f172a', border: '1px solid #cbd5e1' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '12px' }}>Feature Access Permissions</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {permissionsList.map(p => (
                            <div 
                                key={p.id}
                                onClick={() => togglePermission(p.id)}
                                style={{ 
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: selectedPermissions.includes(p.id) ? '#4f46e5' : '#e2e8f0',
                                    background: selectedPermissions.includes(p.id) ? '#eef2ff' : '#fff',
                                    color: selectedPermissions.includes(p.id) ? '#4f46e5' : '#475569',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {p.label} {selectedPermissions.includes(p.id) && '✓'}
                            </div>
                        ))}
                    </div>
                </div>

                {error && <div style={{ gridColumn: 'span 2', color: '#ef4444', fontSize: '14px' }}>{error}</div>}
                {success && <div style={{ gridColumn: 'span 2', color: '#10b981', fontSize: '14px' }}>{success}</div>}

                <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                    <button type="submit" className={styles.logoutBtn} style={{ background: '#451a03' }}>Create Account</button>
                </div>
            </form>
          </section>
        )}

        <section className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Active Staff Members</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>{staffList.length} Accounts Found</p>
          </div>

          <div className={styles.tableContainer}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading staff records...</div>
            ) : staffList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>No staff accounts found. Create one to begin.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>STAFF MEMBER</th>
                    <th>EMAIL</th>
                    <th>ASSIGNED PERMISSIONS</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar} style={{ background: '#f97316' }}>
                            {s.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Staff Member</div>
                          </div>
                        </div>
                      </td>
                      <td>{s.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {s.permissions?.map(p => (
                            <span key={p} className={styles.roleTag} style={{ background: '#f5f2ee', color: '#451a03', fontSize: '10px' }}>
                              {p}
                            </span>
                          ))}
                          {(!s.permissions || s.permissions.length === 0) && <span style={{ color: '#94a3b8', fontSize: '12px' }}>No Permissions</span>}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: s.active ? '#15803d' : '#ef4444' }}>
                          {s.active ? 'Active' : 'Disabled'}
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
