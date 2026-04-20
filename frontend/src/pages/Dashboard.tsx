import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';
import { Link, useNavigate } from 'react-router-dom';

const StarIcon = () => (
  <svg width="14" height="14" fill="#e11d48" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ArrowRight = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const facilities = [
  {
    name: 'Main Auditorium',
    location: 'Block A, Floor 1',
    rating: 4.8,
    tag: 'EVENT HALL',
    themeClass: styles.cardRed,
    imagePath: '/assets/auditorium-3d.png',
  },
  {
    name: 'Innovation Lab',
    location: 'Block B, Floor 2',
    rating: 4.5,
    tag: 'LABORATORY',
    themeClass: styles.cardGreen,
    imagePath: '/assets/lab-3d.png',
  },
  {
    name: 'Sports Complex',
    location: 'Campus South',
    rating: 4.3,
    tag: 'SPORTS',
    themeClass: styles.cardBlue,
    imagePath: '/assets/sports-3d.png',
  },
  {
    name: 'Library Hub',
    location: 'Central Block',
    rating: 4.9,
    tag: 'STUDY SPACE',
    themeClass: styles.cardGold,
    imagePath: '/assets/library-3d.png',
  },
];

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Student';

  const [tickets, setTickets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!token || !user?.id) return;

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch Tickets
        const tRes = await fetch(`${API_BASE}/api/tickets`, { headers });
        const tData = await tRes.json();
        setTickets(Array.isArray(tData) ? tData.slice(0, 3) : []);

        // Fetch Bookings
        const bRes = await fetch(`${API_BASE}/api/bookings/user/${user.id}`, { headers });
        const bData = await bRes.json();
        setBookings(Array.isArray(bData) ? bData.slice(0, 3) : []);

        // Fetch Events
        const eRes = await fetch(`${API_BASE}/api/events`, { headers });
        const eData = await eRes.json();
        const today = new Date().toISOString().split('T')[0];
        const upcoming = Array.isArray(eData) 
          ? eData.filter((e: any) => e.date >= today).sort((a: any, b: any) => a.date.localeCompare(b.date)).slice(0, 3)
          : [];
        setEvents(upcoming);


      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.id]);

  const activeTicketsCount = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div className={styles.page}>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoDot}>●</span>
          SMART<span className={styles.navLogoOrange}>CAMPUS</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/resources" className={styles.navLink}>Facilities</Link>
          <Link to="/bookings" className={styles.navLink}>Bookings</Link>
          <Link to="/calendar" className={styles.navLink}>Calendar</Link>
          <Link to="/tickets" className={styles.navLink}>Support</Link>

          <Link to="/notifications" className={styles.navLink}>Alerts</Link>
        </div>
        <div className={styles.navActions}>
          <span className={styles.navUser}>Welcome back, <b>{firstName}</b></span>
          <button className={styles.navLogout} onClick={logout}>Sign Out</button>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>
              ELEVATE YOUR<br />
              <span className={styles.heroAccent}>CAMPUS LIFE</span>
            </h1>
            <p className={styles.heroDesc}>
              Instant access to campus resources, real-time booking, and seamless support. Your university experience, digitalized and refined.
            </p>

            <div className={styles.heroSearchRow}>
              <div className={styles.heroField} onClick={() => navigate('/resources')}>
                <span className={styles.heroFieldLabel}>Facility Search</span>
                <span className={styles.heroFieldValue}>Labs, Halls, Equipments...</span>
              </div>
              <div className={styles.heroFieldDivider} />
              <div className={styles.heroField} onClick={() => navigate('/bookings')}>
                <span className={styles.heroFieldLabel}>Reservations</span>
                <span className={styles.heroFieldValue}>Check Availability</span>
              </div>
              <button className={styles.heroSearchBtn} onClick={() => navigate('/resources')}>
                <SearchIcon /> Explore
              </button>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroCircle}>
              <img src="/adventurer-3d.png" alt="Mascot" className={styles.hero3dImg} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ BENTO GRID SECTION ══════════ */}
      <section className={styles.bentoSection}>
        <div className={styles.sectionInner}>
          <div className={styles.bentoGrid}>
            
            {/* LARGE CARD: ACTIVE TICKETS */}
            <div className={`${styles.bentoCard} ${styles.cardLarge}`}>
              <span className={styles.bentoTag}>Support Status</span>
              <h2 className={styles.bentoTitle}>Active Requests</h2>
              <p className={styles.bentoDesc}>Track your pending maintenance and support tickets in real-time.</p>
              
              <div className={styles.statusList}>
                {loading ? (
                  <p>Loading tickets...</p>
                ) : tickets.length > 0 ? (
                  tickets.map(t => (
                    <div key={t.id} className={styles.statusItem} onClick={() => navigate(`/tickets/${t.id}`)}>
                      <div className={styles.statusIcon}>🛠️</div>
                      <div className={styles.statusLabel}>
                        <span className={styles.statusName}>{t.title}</span>
                        <span className={styles.statusVal}>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={styles.statusBadge}>{t.status}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.statusItem} style={{ justifyContent: 'center', opacity: 0.5 }}>
                    No active tickets
                  </div>
                )}
              </div>
              
              <button className={styles.bookBtn} style={{ marginTop: '24px', width: '100%' }} onClick={() => navigate('/tickets')}>
                View All Tickets
              </button>
            </div>

            {/* MEDIUM CARD: QUICK STATS */}
            <div className={`${styles.bentoCard} ${styles.cardMedium}`}>
              <span className={styles.bentoTag}>Overview</span>
              <h2 className={styles.bentoTitle}>Your Stats</h2>
              <div style={{ display: 'flex', gap: '20px', marginTop: '24px' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563eb' }}>{activeTicketsCount}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>Open Tickets</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b' }}>{pendingBookingsCount}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>Pending Bookings</div>
                </div>
              </div>
            </div>

            {/* SMALL CARD: RECENT BOOKINGS */}
            <div className={styles.bentoCard}>
              <span className={styles.bentoTag}>Upcoming</span>
              <h2 className={styles.bentoTitle} style={{ fontSize: '24px' }}>Bookings</h2>
              <div className={styles.statusList} style={{ marginTop: '16px', gap: '8px' }}>
                {bookings.length > 0 ? (
                  bookings.slice(0, 2).map(b => (
                    <div key={b.id} className={styles.statusItem} style={{ padding: '10px' }}>
                      <div className={styles.statusLabel}>
                        <span className={styles.statusName} style={{ fontSize: '13px' }}>{b.resourceName}</span>
                        <span className={styles.statusVal} style={{ fontSize: '11px' }}>{b.date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '12px', opacity: 0.5 }}>No recent bookings</p>
                )}
              </div>
            </div>

            {/* SMALL CARD: EVENTS */}
            <div className={styles.bentoCard}>
              <span className={styles.bentoTag}>Calendar</span>
              <h2 className={styles.bentoTitle} style={{ fontSize: '24px' }}>Upcoming</h2>
              <div className={styles.statusList} style={{ marginTop: '16px', gap: '8px' }}>
                {events.length > 0 ? (
                  events.map(e => (
                    <div key={e.id} className={styles.statusItem} style={{ padding: '10px' }} onClick={() => navigate('/calendar')}>
                      <div className={styles.statusLabel}>
                        <span className={styles.statusName} style={{ fontSize: '13px' }}>{e.title}</span>
                        <span className={styles.statusVal} style={{ fontSize: '11px' }}>{e.date} • {e.startTime}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '12px', opacity: 0.5, cursor: 'pointer' }} onClick={() => navigate('/calendar')}>
                    No upcoming events. Check calendar.
                  </p>
                )}
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* ══════════ FACILITIES SECTION ══════════ */}
      <section className={styles.facilitiesSection} id="facilities">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              POPULAR <span className={styles.titleDim}>RESOURCES</span>
            </h2>
          </div>

          <div className={styles.facilityGrid}>
            {facilities.map(f => (
              <div key={f.name} className={`${styles.facilityCard} ${f.themeClass}`}>
                <div className={styles.facilityImg}>
                  <div className={styles.facilityEmojiBg} />
                  <img src={f.imagePath} alt={f.name} className={styles.facilityIcon} />
                  <span className={styles.facilityRating}><StarIcon /> {f.rating}</span>
                </div>
                <div className={styles.facilityBody}>
                  <span className={styles.facilityTag}>{f.tag}</span>
                  <h3 className={styles.facilityName}>{f.name}</h3>
                  <p className={styles.facilityLoc}>📍 {f.location}</p>
                  <div className={styles.facilityFooter}>
                    <span className={styles.facilitySlots}>High Availability</span>
                    <button className={styles.bookBtn} onClick={() => navigate('/bookings')}>Reserve</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionInner}>
          <div className={styles.ctaGlass}>
            <h2 className={styles.ctaTitle}>
              READY TO <span className={styles.heroAccent}>TRANSCEND?</span>
            </h2>
            <p className={styles.ctaDesc}>
              Experience a smarter way to manage your campus tasks. Efficient, transparent, and built for you.
            </p>
            <div className={styles.ctaBtns}>
              <button className={styles.ctaPrimary} onClick={() => navigate('/resources')}>
                Get Started <ArrowRight />
              </button>
              <Link to="/tickets/create" className={styles.ctaSecondary}>Report Issue</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
