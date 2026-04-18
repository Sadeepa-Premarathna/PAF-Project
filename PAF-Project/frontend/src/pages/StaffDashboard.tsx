import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';

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
  { value: '18', label: 'Pending Approvals', sub: 'Needs Attention' },
  { value: '45', label: 'Facility Bookings', sub: 'Today' },
  { value: '6', label: 'Active Reports', sub: 'New Submissions' }
];

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Staff';

  return (
    <div className={styles.page}>
      {/* ══════════ NAVBAR ══════════ */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoDot}>●</span>
          SMART<span className={styles.navLogoOrange}>CAMPUS</span>
          <span style={{ fontSize: '12px', marginLeft: '10px', color: '#f97316', fontWeight: 600 }}>STAFF</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/staff" className={styles.navLink}>Overview</Link>
          <Link to="/staff/approvals" className={styles.navLink}>Approvals</Link>
          <Link to="/staff/facilities" className={styles.navLink}>Facilities</Link>
          <Link to="/staff/reports" className={styles.navLink}>Reports</Link>
        </div>
        <div className={styles.navActions}>
          <span className={styles.navUser}>Member: {firstName}</span>
          <button className={styles.navLogout} onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className={styles.hero} style={{ background: '#1c2834' }}>
        <div className={styles.heroLeafTopLeft} />
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <p className={styles.heroEye}>▸ STAFF PORTAL</p>
            <h1 className={styles.heroTitle}>
              FACILITY & RESOURCE<br />
              <span className={styles.heroOrange}>MANAGEMENT</span>
            </h1>
            <p className={styles.heroDesc}>
              Review facility requests, handle departmental reports, and approve student submissions efficiently.
            </p>
            <div className={styles.heroSearchRow}>
              <div className={styles.heroField}>
                <span className={styles.heroFieldLabel}>SEARCH REQUESTS</span>
                <span className={styles.heroFieldValue}>ID, student name...</span>
              </div>
              <button className={styles.heroSearchBtn}>
                <SearchIcon /> Query
              </button>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroCircle} style={{ background: '#3b82f6' }}>
              <img src="/adventurer-3d.png" alt="Staff" className={styles.hero3dImg} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STAFF STATS ══════════ */}
      <section className={styles.storySection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTopRow}>
            <div>
              <div className={styles.sectionDot}>
                <span className={styles.dotOrange}>●</span>
              </div>
              <h2 className={styles.sectionTitle}>
                TODAY'S <span className={styles.titleOrange}>OPERATIONS</span><br />OVERVIEW
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
            <h2 className={styles.sectionTitle}>STAFF <span className={styles.titleOrange}>WORKFLOWS</span></h2>
            <div className={styles.facilityGrid} style={{ marginTop: '40px' }}>
                <div className={styles.facilityCard}>
                    <div className={styles.facilityImg} style={{ background: '#451a03' }}><span className={styles.facilityEmoji}>📝</span></div>
                    <div className={styles.facilityBody}>
                        <div className={styles.facilityTag}>APPROVALS</div>
                        <h3 className={styles.facilityName}>Pending Requests</h3>
                        <p className={styles.facilityLoc}>Review and approve student bookings.</p>
                        <button className={styles.bookBtn} style={{ width: '100%' }}>Review</button>
                    </div>
                </div>
                <div className={styles.facilityCard}>
                    <div className={styles.facilityImg} style={{ background: '#172554' }}><span className={styles.facilityEmoji}>📅</span></div>
                    <div className={styles.facilityBody}>
                        <div className={styles.facilityTag}>SCHEDULE</div>
                        <h3 className={styles.facilityName}>Facility Calendar</h3>
                        <p className={styles.facilityLoc}>View usage timeline and availability.</p>
                        <button className={styles.bookBtn} style={{ width: '100%' }}>Calendar</button>
                    </div>
                </div>
                <div className={styles.facilityCard}>
                    <div className={styles.facilityImg} style={{ background: '#022c22' }}><span className={styles.facilityEmoji}>📊</span></div>
                    <div className={styles.facilityBody}>
                        <div className={styles.facilityTag}>REPORTS</div>
                        <h3 className={styles.facilityName}>Incident Logs</h3>
                        <p className={styles.facilityLoc}>Manage infrastructure issue reports.</p>
                        <Link to="/tickets" className={styles.bookBtn} style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none' }}>Manage</Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className={styles.ctaSection} style={{ background: '#f5f2ee' }}>
        <div className={styles.sectionInner}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>TEAM <span className={styles.titleOrange}>MEETING</span> AT 3PM</h2>
            <p className={styles.ctaDesc}>Please prepare the weekly operations report before the staff sync.</p>
            <div className={styles.ctaBtns}>
              <button className={styles.ctaPrimary}>View Agenda <ArrowRight /></button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
