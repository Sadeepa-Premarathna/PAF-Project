import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';
import { Link, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Staff';

  return (
    <div className={styles.page}>
      {/* ══════════ NAVBAR ══════════ */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoDot}>●</span>
          SMART<span className={styles.navLogoOrange}>CAMPUS</span>
          <span style={{ fontSize: '12px', marginLeft: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px' }}>STAFF</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/staff" className={styles.navLink}>Overview</Link>
          {(user?.permissions || []).includes('BOOKINGS') && <Link to="/staff/approvals" className={styles.navLink}>Approvals</Link>}
          {(user?.permissions || []).includes('RESOURCES') && <Link to="/resources" className={styles.navLink}>Facilities</Link>}
          {(user?.permissions || []).includes('TICKETS') && <Link to="/tickets" className={styles.navLink}>Reports</Link>}
        </div>
        <div className={styles.navActions}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '15px' }}>
            <span className={styles.navUser}>OPERATIVE: <b>{firstName}</b></span>
            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
               {user?.permissions?.map(p => (
                 <span key={p} style={{ fontSize: '9px', background: 'var(--accent-ultra)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 700 }}>{p}</span>
               ))}
            </div>
          </div>
          <button className={styles.navLogout} onClick={logout}>Sign Out</button>
        </div>
      </nav>

      {/* ══════════ STAFF HERO ══════════ */}
      <section className={styles.heroBase}>
        <div className={styles.heroContainer} style={{ background: '#ffffff' }}>
          <div className={styles.heroHeader}>
            <h1 className={styles.heroTitleStyled}>
              OPERATIONAL EXCELLENCE<br />
              <span className={styles.heroAccentStyled}>MANAGEMENT HUB</span>
            </h1>
          </div>

          <div className={styles.heroMainContent}>
            <div className={styles.heroLeftPane}>
              <p className={styles.heroDescription}>
                Monitor campus resources, authorize access requests, and maintain the digital infrastructure of SmartCampus in real-time.
              </p>
              <button className={styles.heroPillBtn} onClick={() => navigate('/staff/approvals')}>View Pending Tasks</button>
            </div>

            <div className={styles.heroCenterPane}>
              <div className={styles.heroImgContainer}>
                <img src="/staff-mascot.png" alt="Staff Mascot" className={styles.heroMainImg} onError={(e) => e.currentTarget.src='/hero-student.png'} />
                <div className={styles.floatingDeco1}>⚡</div>
                <div className={styles.floatingDeco2}>⚙️</div>
              </div>
            </div>

            <div className={styles.heroRightPane}>
              <div className={styles.heroStatsBadge}>
                <div className={styles.badgeVal}>100%</div>
                <div className={styles.badgeLabel}>System Uptime</div>
              </div>
            </div>
          </div>

          <div className={styles.heroActionBar}>
            <button className={styles.actionBtnStart} onClick={() => navigate('/staff/approvals')}>Process Approvals</button>
            <button className={styles.actionBtnCollab} onClick={() => navigate('/notifications')}>Broadcast Alert</button>
          </div>
        </div>
      </section>

      {/* ══════════ STAFF BENTO GRID ══════════ */}
      <section className={styles.bentoSection}>
        <div className={styles.sectionInner}>
          <div className={styles.bentoGrid}>
            
            {/* LARGE CARD: OPERATIONAL OVERVIEW */}
            <div className={`${styles.bentoCard} ${styles.cardLarge}`}>
              <span className={styles.bentoTag}>System Status</span>
              <h2 className={styles.bentoTitle}>Live Operations</h2>
              <p className={styles.bentoDesc}>Active monitoring of departmental logs and resource utilization across the campus.</p>
              
              <div className={styles.statusList}>
                {stats.map(s => (
                  <div key={s.label} className={styles.statusItem}>
                    <div className={styles.statusIcon}>📊</div>
                    <div className={styles.statusLabel}>
                      <span className={styles.statusName}>{s.label}</span>
                      <span className={styles.statusVal}>{s.sub}</span>
                    </div>
                    <span className={styles.statusBadge} style={{ background: 'var(--accent-ultra)', color: 'var(--accent)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className={`${styles.bentoCard} ${styles.cardMedium}`}>
              <span className={styles.bentoTag}>Quick Access</span>
              <h2 className={styles.bentoTitle}>Manager <span style={{ color: 'var(--accent)' }}>Workflows</span></h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
                {user?.permissions?.includes('BOOKINGS') && (
                  <div onClick={() => navigate('/staff/approvals')} style={{ cursor: 'pointer', textAlign: 'center', padding: '15px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
                     <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>Approvals</div>
                  </div>
                )}
                {user?.permissions?.includes('RESOURCES') && (
                  <div onClick={() => navigate('/resources')} style={{ cursor: 'pointer', textAlign: 'center', padding: '15px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏢</div>
                     <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>Facilities</div>
                  </div>
                )}
                {user?.permissions?.includes('TICKETS') && (
                  <div onClick={() => navigate('/tickets')} style={{ cursor: 'pointer', textAlign: 'center', padding: '15px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛠️</div>
                     <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>Tickets</div>
                  </div>
                )}
              </div>
            </div>

            {/* MESSAGE OF THE DAY */}
            <div className={styles.bentoCard}>
              <span className={styles.bentoTag}>Bulletin</span>
              <h2 className={styles.bentoTitle} style={{ fontSize: '20px' }}>Notice</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-ghost)', marginTop: '10px' }}>
                Weekly operations meeting today at 3:00 PM in the Main Block Conference Room.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionInner}>
          <div className={styles.ctaGlass}>
             <h2 className={styles.ctaTitle}>TEAM <span className={styles.heroAccent}>SYNC</span></h2>
             <p className={styles.ctaDesc}>Prepare the weekly operations report before the synchronization session.</p>
             <button className={styles.ctaPrimary} style={{ margin: '0 auto' }}>View Agenda <ArrowRight /></button>
          </div>
        </div>
      </section>

    </div>
  );

}
