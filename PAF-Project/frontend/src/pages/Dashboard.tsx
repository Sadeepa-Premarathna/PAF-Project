import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

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

const facilities = [
  {
    name: 'Main Auditorium',
    location: 'Block A, Floor 1',
    rating: 4.8,
    tag: 'EVENT HALL',
    color: '#1a3d2b',
    emoji: '🎭',
  },
  {
    name: 'Innovation Lab',
    location: 'Block B, Floor 2',
    rating: 4.5,
    tag: 'LABORATORY',
    color: '#1c2f1a',
    emoji: '⚗️',
  },
  {
    name: 'Sports Court',
    location: 'Campus Ground',
    rating: 4.3,
    tag: 'SPORTS',
    color: '#1a2535',
    emoji: '🏀',
  },
];

const stats = [
  { value: '124+', label: 'Campus Facilities', sub: 'Available Now' },
  { value: '16+', label: 'Departments', sub: 'Connected' },
  { value: '20+', label: 'Years of Operation', sub: 'Excellence' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <div className={styles.page}>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoDot}>●</span>
          SMART<span className={styles.navLogoOrange}>CAMPUS</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#facilities" className={styles.navLink}>Facilities</a>
          <a href="#bookings" className={styles.navLink}>Bookings</a>
          <a href="#tickets" className={styles.navLink}>Tickets</a>
          <a href="#about" className={styles.navLink}>About</a>
        </div>
        <div className={styles.navActions}>
          <span className={styles.navUser}>Hi, {firstName}</span>
          <button className={styles.navLogout} onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className={styles.hero}>
        {/* Decorative bg leaves */}
        <div className={styles.heroLeafTopLeft} />
        <div className={styles.heroLeafBottomRight} />

        {/* ── BACKGROUND ANIMATION ── */}
        <div className={styles.leafContainer}>
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={styles.leaf} 
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                width: `${Math.random() * 25 + 15}px`,
                height: `${Math.random() * 25 + 15}px`
              }} 
            />
          ))}
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>
              NAVIGATE YOUR<br />
              <span className={styles.heroOrange}>CAMPUS LIFE</span>
            </h1>
            <p className={styles.heroDesc}>
              Book facilities, report incidents, and explore every resource your campus has to offer — all from one place designed for students like you.
            </p>

            {/* Search bar row */}
            <div className={styles.heroSearchRow}>
              <div className={styles.heroField}>
                <span className={styles.heroFieldLabel}>FACILITY</span>
                <span className={styles.heroFieldValue}>Lecture Halls, Labs, Courts...</span>
              </div>
              <div className={styles.heroFieldDivider} />
              <div className={styles.heroField}>
                <span className={styles.heroFieldLabel}>DATE</span>
                <span className={styles.heroFieldValue}>Pick a date</span>
              </div>
              <button className={styles.heroSearchBtn}>
                <SearchIcon /> Search
              </button>
            </div>
          </div>

          {/* Hero character art */}
          <div className={styles.heroRight}>
            <div className={styles.heroCircle}>
              <img src="/adventurer-3d.png" alt="Adventurer" className={styles.hero3dImg} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FACILITIES SECTION ══════════ */}
      <section className={styles.facilitiesSection} id="facilities">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTopRow}>
            <div>
              <div className={styles.sectionDot}>
                <span className={styles.dotOrange}>●</span>
              </div>
              <h2 className={styles.sectionTitle}>
                FIND <span className={styles.titleOrange}>POPULAR</span><br />FACILITIES
              </h2>
            </div>
            <div className={styles.arrowBtns}>
              <button className={styles.arrowBtn}>‹</button>
              <button className={styles.arrowBtn}>›</button>
            </div>
          </div>

          <div className={styles.facilityGrid}>
            {facilities.map(f => (
              <div key={f.name} className={styles.facilityCard}>
                <div className={styles.facilityImg} style={{ background: f.color }}>
                  <span className={styles.facilityEmoji}>{f.emoji}</span>
                  <span className={styles.facilityRating}><StarIcon /> {f.rating}</span>
                </div>
                <div className={styles.facilityBody}>
                  <div className={styles.facilityTag}>{f.tag}</div>
                  <h3 className={styles.facilityName}>{f.name}</h3>
                  <p className={styles.facilityLoc}>{f.location}</p>
                  <div className={styles.facilityFooter}>
                    <span className={styles.facilitySlots}>8 slots open</span>
                    <button className={styles.bookBtn}>Book</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ STORY / STATS SECTION ══════════ */}
      <section className={styles.storySection}>
        <div className={styles.sectionInner}>
          <div className={styles.storyGrid}>
            {/* Left: illustration */}
            <div className={styles.storyLeft}>
              <div className={styles.storyCircle}>
                <img src="/facility-3d.png" alt="Facility" className={styles.hero3dImg} />
              </div>
            </div>

            {/* Right: text + stats */}
            <div className={styles.storyRight}>
              <div className={styles.sectionDot}>
                <span className={styles.dotOrange}>●</span>
              </div>
              <h2 className={styles.sectionTitle}>
                OUR <span className={styles.titleOrange}>CAMPUS</span> WITH<br />
                STUDENTS
              </h2>
              <p className={styles.storyDesc}>
                SmartCampus is built by students, for students. We provide the infrastructure for a seamless academic experience — from reserving your favourite lab to reporting issues in minutes.
              </p>
              <p className={styles.storyDesc}>
                Don't wait to get started — your campus resources are ready and waiting for you!
              </p>

              <div className={styles.statsRow}>
                {stats.map(s => (
                  <div key={s.label} className={styles.statItem}>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                    <div className={styles.statSub}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionInner}>
          <div className={styles.ctaContent}>
            <div className={styles.sectionDot}>
              <span className={styles.dotOrange}>●</span>
            </div>
            <h2 className={styles.ctaTitle}>
              START MANAGING YOUR<br />
              <span className={styles.titleOrange}>CAMPUS EXPERIENCE</span><br />
              WITH EASE
            </h2>
            <p className={styles.ctaDesc}>
              Every resource on campus is available at your fingertips — explore, book, and enjoy your university life to the fullest.
            </p>
            <div className={styles.ctaBtns}>
              <button className={styles.ctaPrimary}>Explore Facilities <ArrowRight /></button>
              <button className={styles.ctaSecondary}>Report an Issue</button>
            </div>
          </div>

          {/* Decorative circles */}
          <div className={styles.ctaCircles}>
            <div className={styles.ctaCircle1}>🏛️</div>
            <div className={styles.ctaCircle2}>🔬</div>
            <div className={styles.ctaCircle3}>📚</div>
          </div>
        </div>
      </section>

    </div>
  );
}
