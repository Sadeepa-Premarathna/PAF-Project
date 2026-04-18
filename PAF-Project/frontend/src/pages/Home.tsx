import { Link } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const leaves = Array.from({ length: 15 });

  return (
    <div className={styles.container}>
      {/* ── BACKGROUND ANIMATION ── */}
      <div className={styles.bgOverlay} />
      <div className={styles.leafContainer}>
        {leaves.map((_, i) => (
          <div
            key={i}
            className={styles.leaf}
            style={{
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 20 + 15}s`,
              borderRadius: `${Math.random() * 50 + 25}% ${Math.random() * 50 + 25}%`,
              background: `rgba(34, 197, 94, ${Math.random() * 0.15 + 0.05})`,
            }}
          />
        ))}
      </div>

      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
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
          <span className={styles.eyebrow}>▸ START YOUR CAMPUS ADVENTURE</span>
          <h1 className={styles.title}>
            BEYOND THE<br />
            <span className={styles.orangeText}>CLASSROOM</span>
          </h1>
          <p className={styles.desc}>
            The first 3D-inspired all-in-one smart portal for modern students. 
            Manage your schedule, book state-of-the-art facilities, and discover 
            the unexplored resources of your university.
          </p>
          <div className={styles.btns}>
            <Link to="/register" className={styles.primaryBtn}>Get Started</Link>
            <Link to="/login" className={styles.secondaryBtn}>Sign In</Link>
          </div>
        </div>
      </main>

      {/* ── FLOAT DECOR ── */}
      <div 
        className={styles.flare} 
        style={{ top: '10%', right: '-10%' }}
      />
      <div 
        className={styles.flare} 
        style={{ bottom: '5%', left: '-5%' }}
      />
    </div>
  );
}
