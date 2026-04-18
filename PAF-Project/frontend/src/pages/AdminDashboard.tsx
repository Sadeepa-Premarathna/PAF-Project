import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';

const StarIcon = () => (
  <svg width="14" height="14" fill="#f97316" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const stats = [
  { value: '482', label: 'Total Users', sub: 'Active Members' },
  { value: '1,240', label: 'System Requests', sub: 'Processed Today' },
  { value: '99.9%', label: 'System Uptime', sub: 'Operational' },
  { value: '14', label: 'Pending Issues', sub: 'Requires Attention' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className={styles.page}>
      {/* ══════════ NAVBAR ══════════ */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoDot}>●</span>
          SMART<span className={styles.navLogoOrange}>CAMPUS</span>
          <span style={{ fontSize: '12px', marginLeft: '10px', color: '#f97316', fontWeight: 600 }}>ADMIN</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/admin" className={styles.navLink}>Overview</Link>
          <Link to="/admin/users" className={styles.navLink}>User Management</Link>
          <Link to="/admin/facilities" className={styles.navLink}>Facility Admin</Link>
          <Link to="/admin/tickets" className={styles.navLink}>Ticket Support</Link>
        </div>
        <div className={styles.navActions}>
          <span className={styles.navUser}>System: {firstName}</span>
          <button className={styles.navLogout} onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className={styles.hero} style={{ background: '#0a1a10' }}>
        <div className={styles.heroLeafTopLeft} />
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <p className={styles.heroEye}>▸ CONTROL CENTER</p>
            <h1 className={styles.heroTitle}>
              ADMINISTRATIVE<br />
              <span className={styles.heroOrange}>OVERSIGHT</span>
            </h1>
            <p className={styles.heroDesc}>
              Monitor campus health, manage global resources, and resolve student tickets from your unified command dashboard.
            </p>
            <div className={styles.heroSearchRow}>
              <div className={styles.heroField}>
                <span className={styles.heroFieldLabel}>SEARCH SYSTEM</span>
                <span className={styles.heroFieldValue}>Users, UID, Resources...</span>
              </div>
              <button className={styles.heroSearchBtn}>
                <SearchIcon /> Query
              </button>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroCircle} style={{ background: '#1a5c38' }}>
              <img src="/adventurer-3d.png" alt="Admin" className={styles.hero3dImg} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ ADMIN STATS ══════════ */}
      <section className={styles.storySection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTopRow}>
            <div>
              <div className={styles.sectionDot}>
                <span className={styles.dotOrange}>●</span>
              </div>
              <h2 className={styles.sectionTitle}>
                SYSTEM <span className={styles.titleOrange}>PERFORMANCE</span><br />METRICS
              </h2>
            </div>
          </div>

          <div className={styles.statsRow} style={{ border: 'none', justifyContent: 'space-between', gap: '20px' }}>
            {stats.map(s => (
              <div key={s.label} className={styles.statItem} style={{ background: 'white', padding: '30px', borderRadius: '16px', flex: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div className={styles.statValue} style={{ color: '#f97316' }}>{s.value}</div>
                <div className={styles.statLabel} style={{ fontSize: '14px' }}>{s.label}</div>
                <div className={styles.statSub}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ QUICK ACTIONS ══════════ */}
      <section className={styles.facilitiesSection}>
        <div className={styles.sectionInner}>
            <div className={styles.sectionDot}><span className={styles.dotOrange}>●</span></div>
            <h2 className={styles.sectionTitle}>ADMIN <span className={styles.titleOrange}>FAST</span> TRACK</h2>
            <div className={styles.facilityGrid} style={{ marginTop: '40px' }}>
                <div className={styles.facilityCard}>
                    <div className={styles.facilityImg} style={{ background: '#1a2535' }}><span className={styles.facilityEmoji}>👥</span></div>
                    <div className={styles.facilityBody}>
                        <div className={styles.facilityTag}>USER ROLES</div>
                        <h3 className={styles.facilityName}>Manage Permissions</h3>
                        <p className={styles.facilityLoc}>Grant or revoke access across the platform.</p>
                        <button className={styles.bookBtn} style={{ width: '100%' }}>Manage Users</button>
                    </div>
                </div>
                <div className={styles.facilityCard}>
                    <div className={styles.facilityImg} style={{ background: '#1a3d2b' }}><span className={styles.facilityEmoji}>🏗️</span></div>
                    <div className={styles.facilityBody}>
                        <div className={styles.facilityTag}>INFRASTRUCTURE</div>
                        <h3 className={styles.facilityName}>Resource Registry</h3>
                        <p className={styles.facilityLoc}>Update availability for lecture halls and labs.</p>
                        <button className={styles.bookBtn} style={{ width: '100%' }}>Registry</button>
                    </div>
                </div>
                <div className={styles.facilityCard}>
                    <div className={styles.facilityImg} style={{ background: '#3b82f6' }}><span className={styles.facilityEmoji}>🛠️</span></div>
                    <div className={styles.facilityBody}>
                        <div className={styles.facilityTag}>SUPPORT</div>
                        <h3 className={styles.facilityName}>Critical Tickets</h3>
                        <p className={styles.facilityLoc}>Resolve high priority infrastructure issues.</p>
                        <button className={styles.bookBtn} style={{ width: '100%' }}>Resolution</button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className={styles.ctaSection} style={{ background: '#f5f2ee' }}>
        <div className={styles.sectionInner}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>SYSTEM <span className={styles.titleOrange}>READY</span> FOR UPDATES</h2>
            <p className={styles.ctaDesc}>Maintenance scheduled for 02:00 AM. Ensure all critical logs are reviewed before the sync.</p>
            <div className={styles.ctaBtns}>
              <button className={styles.ctaPrimary}>View System Logs <ArrowRight /></button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
