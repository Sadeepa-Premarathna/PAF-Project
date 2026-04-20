import { Link } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const particles = Array.from({ length: 12 });

  return (
    <div className={styles.container}>
      {/* ── BACKGROUND ── */}
      <div className={styles.bgOverlay} />
      <div className={styles.leafContainer}>
        {particles.map((_, i) => (
          <div
            key={i}
            className={styles.leaf}
            style={{
              width: `${Math.random() * 36 + 16}px`,
              height: `${Math.random() * 36 + 16}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 18}s`,
              animationDuration: `${Math.random() * 15 + 18}s`,
            }}
          />
        ))}
      </div>

      {/* ── DECORATIVE FLARES ── */}
      <div className={styles.flare} style={{ top: '5%', right: '-12%' }} />
      <div className={styles.flare} style={{ bottom: '0%', left: '-8%' }} />

      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoDot}>●</span>
          SMART<span className={styles.logoOrange}>CAMPUS</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/login" className={styles.navLink}>Login</Link>
          <Link to="/register" className={styles.navLink}>Register</Link>
          <a href="#explore" className={styles.navLink}>Explore</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main className={styles.main}>
        <div className={styles.hero}>
          <span className={styles.eyebrow}>Start Your Campus Adventure</span>

          <h1 className={styles.title}>
            BEYOND THE<br />
            <span className={styles.orangeText}>CLASSROOM</span>
          </h1>

          <p className={styles.desc}>
            The first AI-powered all-in-one smart portal for modern students.
            Manage your schedule, book state-of-the-art facilities, and discover
            the unexplored resources of your university.
          </p>

          <div className={styles.btns}>
            <Link to="/register" className={styles.primaryBtn}>Get Started →</Link>
            <Link to="/login" className={styles.secondaryBtn}>Sign In</Link>
          </div>

          {/* ── STATS STRIP ── */}
          <div className={styles.statsStrip}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>124+</div>
              <div className={styles.statLabel}>Facilities</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statNumber}>16+</div>
              <div className={styles.statLabel}>Departments</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statNumber}>5K+</div>
              <div className={styles.statLabel}>Students</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statNumber}>20+</div>
              <div className={styles.statLabel}>Years</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
