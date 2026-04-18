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
              <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg" width="220">
                {/* Body */}
                <ellipse cx="100" cy="200" rx="45" ry="55" fill="#1a3a28" />
                {/* Head */}
                <circle cx="100" cy="90" r="36" fill="#f4c89a" />
                {/* Hair */}
                <ellipse cx="100" cy="65" rx="36" ry="22" fill="#3d2300" />
                {/* Left arm raised */}
                <path d="M57 130 Q30 100 40 75" stroke="#f4c89a" strokeWidth="14" strokeLinecap="round" fill="none"/>
                {/* Map in hand */}
                <rect x="18" y="60" width="28" height="22" rx="3" fill="#fff" stroke="#f97316" strokeWidth="2"/>
                <line x1="24" y1="68" x2="40" y2="68" stroke="#f97316" strokeWidth="1.5"/>
                <line x1="24" y1="74" x2="36" y2="74" stroke="#f97316" strokeWidth="1.5"/>
                {/* Right arm */}
                <path d="M143 130 Q165 120 158 145" stroke="#f4c89a" strokeWidth="14" strokeLinecap="round" fill="none"/>
                {/* Backpack */}
                <rect x="72" y="140" width="56" height="68" rx="10" fill="#c0392b" />
                <rect x="80" y="148" width="40" height="30" rx="6" fill="#e74c3c" />
                <rect x="92" y="158" width="16" height="3" rx="1.5" fill="#c0392b"/>
                <rect x="98" y="152" width="3" height="16" rx="1.5" fill="#c0392b"/>
                {/* Straps */}
                <path d="M82 140 Q68 160 72 185" stroke="#a93226" strokeWidth="6" strokeLinecap="round" fill="none"/>
                <path d="M118 140 Q132 160 128 185" stroke="#a93226" strokeWidth="6" strokeLinecap="round" fill="none"/>
                {/* Sleeping mat roll on top */}
                <ellipse cx="100" cy="138" rx="22" ry="8" fill="#e6b800" />
                <rect x="78" y="134" width="44" height="8" rx="4" fill="#f1c40f" />
                {/* Legs */}
                <rect x="80" y="202" width="16" height="48" rx="8" fill="#2c5f3f" />
                <rect x="104" y="202" width="16" height="48" rx="8" fill="#2c5f3f" />
                {/* Boots */}
                <ellipse cx="88" cy="250" rx="14" ry="8" fill="#1a1a1a" />
                <ellipse cx="112" cy="250" rx="14" ry="8" fill="#1a1a1a" />
                {/* Sunglasses */}
                <rect x="82" y="88" width="16" height="10" rx="5" fill="#1a1a1a" opacity="0.8"/>
                <rect x="102" y="88" width="16" height="10" rx="5" fill="#1a1a1a" opacity="0.8"/>
                <line x1="98" y1="93" x2="102" y2="93" stroke="#1a1a1a" strokeWidth="2"/>
              </svg>
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
                <svg viewBox="0 0 180 240" fill="none" xmlns="http://www.w3.org/2000/svg" width="190">
                  {/* Running student figure */}
                  <circle cx="90" cy="72" r="30" fill="#f4c89a" />
                  <ellipse cx="90" cy="55" rx="30" ry="18" fill="#3d2300" />
                  <ellipse cx="90" cy="155" rx="40" ry="52" fill="#1a5c38" />
                  {/* Arms spread joyfully */}
                  <path d="M52 120 Q20 95 28 70" stroke="#f4c89a" strokeWidth="13" strokeLinecap="round" fill="none"/>
                  <path d="M128 120 Q160 95 152 70" stroke="#f4c89a" strokeWidth="13" strokeLinecap="round" fill="none"/>
                  {/* Backpack */}
                  <rect x="66" y="130" width="48" height="58" rx="10" fill="#c0392b" />
                  <rect x="74" y="138" width="32" height="26" rx="6" fill="#e74c3c" />
                  <path d="M74 130 Q62 148 66 170" stroke="#a93226" strokeWidth="5" strokeLinecap="round" fill="none"/>
                  <path d="M106 130 Q118 148 114 170" stroke="#a93226" strokeWidth="5" strokeLinecap="round" fill="none"/>
                  {/* Legs */}
                  <path d="M80 203 Q72 225 68 238" stroke="#1a3d28" strokeWidth="14" strokeLinecap="round" fill="none"/>
                  <path d="M100 203 Q112 220 118 238" stroke="#1a3d28" strokeWidth="14" strokeLinecap="round" fill="none"/>
                  {/* Boots */}
                  <ellipse cx="68" cy="238" rx="12" ry="7" fill="#1a1a1a" />
                  <ellipse cx="118" cy="238" rx="12" ry="7" fill="#1a1a1a" />
                  {/* Big smile */}
                  <path d="M78 78 Q90 90 102 78" stroke="#d4956a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                </svg>
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
