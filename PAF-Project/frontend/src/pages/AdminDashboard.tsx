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
        <div className={styles.logo}>A</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <Link to="/admin" className={`${styles.navIcon} ${styles.active}`}><UserIcon /></Link>
          <Link to="/tickets" className={styles.navIcon} title="Tickets"><DocIcon /></Link>
          <div className={styles.navIcon}><BellIcon /></div>
        </div>

        <div className={styles.navIcon} onClick={logout} title="Logout"><SettingsIcon /></div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className={styles.mainContainer}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.greeting}>Good Morning {firstName}</h1>
            <p className={styles.subGreeting}>Your daily administrative overview</p>
          </div>
          <div className={styles.headerRight}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '12px', color: '#94a3b8' }}><SearchIcon /></div>
              <input type="text" placeholder="Search users..." className={styles.searchBar} style={{ paddingLeft: '44px' }} />
            </div>
            <div className={styles.navIcon} style={{ background: '#fff' }}><BellIcon /></div>
            <button className={styles.logoutBtn} onClick={logout}>Sign Out</button>
            <div className={styles.profilePic}>
              <img src={user?.pictureUrl || `https://ui-avatars.com/api/?name=${firstName}&background=4f46e5&color=fff`} alt="Profile" style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </header>

        {/* METRICS ROW */}
        <div>
          <h2 className={styles.sectionTitle}>System Metrics</h2>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} style={{ background: '#4f46e5' }} />
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconBox}><UserIcon /></div>
                <div className={styles.kpiPerc} style={{ color: '#4f46e5', borderColor: '#4f46e5' }}>+12</div>
              </div>
              <div>
                <div className={styles.kpiValue}>{usersList.length}</div>
                <div className={styles.kpiLabel}>Total Users</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} style={{ background: '#0ea5e9' }} />
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconBox}><DocIcon /></div>
                <div className={styles.kpiPerc} style={{ color: '#0ea5e9', borderColor: '#0ea5e9' }}>5%</div>
              </div>
              <div>
                <div className={styles.kpiValue}>1,240</div>
                <div className={styles.kpiLabel}>System Requests</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} style={{ background: '#8b5cf6' }} />
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconBox}><BellIcon /></div>
                <div className={styles.kpiPerc} style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}>0%</div>
              </div>
              <div>
                <div className={styles.kpiValue}>99.9%</div>
                <div className={styles.kpiLabel}>System Uptime</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiAccent} style={{ background: '#10b981' }} />
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconBox}><SettingsIcon /></div>
                <div className={styles.kpiPerc} style={{ color: '#10b981', borderColor: '#10b981' }}>Live</div>
              </div>
              <div>
                <Link to="/tickets" style={{ textDecoration: 'none' }}>
                  <div className={styles.kpiValue}>{openTicketsCount}</div>
                  <div className={styles.kpiLabel}>Open Tickets</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className={styles.bottomSplit}>
          
          <div className={styles.tallCard}>
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>⋮</div>
            <div className={styles.arcContainer}>
              <div className={styles.arc}></div>
              <div className={styles.arcText}>100%</div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <div className={styles.kpiIconBox} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', margin: '0 auto 16px' }}><DocIcon /></div>
            </div>
            <div className={styles.tallCardLabel}>System Health</div>
            <div className={styles.tallCardValue}>Optimal</div>
            <div className={styles.tallCardSub}>All services running correctly</div>
          </div>

          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>User Directory</h2>
              <div style={{ color: '#64748b', cursor: 'pointer', fontWeight: 600 }}>⋮</div>
            </div>

            <div className={styles.tableContainer}>
              {loadingUsers ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading directory...</div>
              ) : usersList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No users found.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>USER</th>
                      <th>ROLE</th>
                      <th>ID & DEPT</th>
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
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.roleTag} style={{ 
                            background: u.role === 'ADMIN' ? '#fee2e2' : u.role === 'STAFF_MEMBER' ? '#e0e7ff' : '#f1f5f9', 
                            color: u.role === 'ADMIN' ? '#991b1b' : u.role === 'STAFF_MEMBER' ? '#3730a3' : '#334155' 
                          }}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#334155' }}>{u.studentId}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{u.department}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: u.active ? '#15803d' : '#ef4444' }}>
                            {u.active ? 'Active' : 'Disabled'}
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
