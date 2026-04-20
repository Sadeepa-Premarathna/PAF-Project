import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './AdminDashboard.module.css';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080';

const SearchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DocIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

interface AppUser {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  role: string;
  active: boolean;
}

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);

  useEffect(() => {
    const fetchOpenTickets = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tickets/stats/open-count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOpenTicketsCount(data.count);
        }
      } catch (err) {
        console.error('Failed to fetch ticket count', err);
      }
    };
    if (token) fetchOpenTickets();
  }, [token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsersList(data);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  return (
    <div className={styles.page}>
      
      {/* ─── SIDEBAR ─── */}
      <div className={styles.sidebar}>
        <div className={styles.logo}>SC</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <Link to="/admin" className={`${styles.navIcon} ${styles.active}`} title="Users"><UserIcon /></Link>
          <Link to="/admin/staff" className={styles.navIcon} title="Manage Staff"><ShieldIcon /></Link>
          <Link to="/admin/resources" className={styles.navIcon} title="Manage Resources"><GridIcon /></Link>
          <Link to="/admin/bookings" className={styles.navIcon} title="Manage Bookings"><CalendarIcon /></Link>
          <Link to="/tickets" className={styles.navIcon} title="Tickets"><DocIcon /></Link>
          <Link to="/admin/notifications" className={styles.navIcon} title="Notifications"><BellIcon /></Link>
        </div>

        <div className={styles.navIcon} onClick={logout} title="Logout" style={{ marginTop: 'auto' }}><SettingsIcon /></div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className={styles.mainContainer}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.greeting}>SYSTEM CONTROL</h1>
            <p className={styles.subGreeting}>Administrative oversight & operational metrics</p>
          </div>
          <div className={styles.headerRight}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '12px', color: 'var(--accent)' }}><SearchIcon /></div>
              <input type="text" placeholder="Search directory..." className={styles.searchBar} style={{ paddingLeft: '44px' }} />
            </div>
            <button className={styles.logoutBtn} onClick={logout}>Sign Out</button>
            <div className={styles.profilePic}>
              <img src={user?.pictureUrl || `https://ui-avatars.com/api/?name=${firstName}&background=22c55e&color=080d08`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </header>

        {/* METRICS ROW */}
        <div>
          <h2 className={styles.sectionTitle}>Real-time Metrics</h2>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} />
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconBox}><UserIcon /></div>
                <div className={styles.kpiPerc}>LIVE</div>
              </div>
              <div>
                <div className={styles.kpiValue}>{usersList.length}</div>
                <div className={styles.kpiLabel}>Total Registered</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} />
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconBox}><DocIcon /></div>
                <div className={styles.kpiPerc}>+5%</div>
              </div>
              <div>
                <div className={styles.kpiValue}>1.2K</div>
                <div className={styles.kpiLabel}>API Traffic</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} />
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconBox}><BellIcon /></div>
                <div className={styles.kpiPerc}>99%</div>
              </div>
              <div>
                <div className={styles.kpiValue}>0.8ms</div>
                <div className={styles.kpiLabel}>Latency Avg</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} />
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconBox}><SettingsIcon /></div>
                <div className={styles.kpiPerc}>ACTIVE</div>
              </div>
              <div>
                <Link to="/tickets" style={{ textDecoration: 'none' }}>
                  <div className={styles.kpiValue}>{openTicketsCount}</div>
                  <div className={styles.kpiLabel}>Critical Alerts</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className={styles.bottomSplit}>
          
          <div className={styles.tallCard}>
            <div className={styles.arcContainer}>
              <div className={styles.arc}></div>
              <div className={styles.arcText}>100</div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <div className={styles.kpiIconBox} style={{ background: 'var(--accent-ultra)', border: '1px solid var(--accent)', color: 'var(--accent)', margin: '0 auto 16px' }}><ShieldIcon /></div>
            </div>
            <div className={styles.tallCardLabel}>Core Infrastructure</div>
            <div className={styles.tallCardValue}>STABLE</div>
            <div className={styles.tallCardSub}>All nodes operating nominally</div>
          </div>

          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Identity Directory</h2>
              <div style={{ color: 'var(--text-ghost)', cursor: 'pointer', fontWeight: 600 }}>FILTER ▾</div>
            </div>

            <div className={styles.tableContainer}>
              {loadingUsers ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-ghost)' }}>Synchronizing directory...</div>
              ) : usersList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-ghost)' }}>No records found.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>IDENTITY</th>
                      <th>ROLE</th>
                      <th>CREDENTIALS</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.slice(0, 5).map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.userAvatar}>
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-ghost)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.roleTag} style={{ 
                            background: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : u.role === 'STAFF_MEMBER' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                            color: u.role === 'ADMIN' ? '#f87171' : u.role === 'STAFF_MEMBER' ? '#22c55e' : 'var(--text-ghost)',
                            border: `1px solid ${u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.2)' : u.role === 'STAFF_MEMBER' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                          }}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>{u.studentId}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{u.department}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: u.active ? 'var(--accent)' : '#ef4444', fontSize: '12px' }}>
                            {u.active ? 'ENABLED' : 'REVOKED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );

}
