import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login() {
  const { login, loginWithPassword, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oauthError = searchParams.get('error');
  const oauthDetail = searchParams.get('detail');

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (user.role === 'STAFF_MEMBER') navigate('/staff', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const handleGoogleLogin = () => { setIsRedirecting(true); login(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithPassword(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingScreen}>
          <div className={styles.spinner} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <span className={styles.navDot}>●</span>
          SMART<span className={styles.navOrange}>CAMPUS</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/about" className={styles.navLink}>About</Link>
          <Link to="/services" className={styles.navLink}>Services</Link>
        </div>
        <Link to="/register" className={styles.navRegister}>Register</Link>
      </nav>

      {/* ── SPLIT BODY ── */}
      <div className={styles.body}>

        <div className={styles.leftPane}>
          <div className={styles.heroLeaf1} />
          <div className={styles.heroLeaf2} />

          {/* ── BACKGROUND ANIMATION ── */}
          <div className={styles.leafContainer}>
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={styles.leaf} 
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  width: `${Math.random() * 20 + 20}px`,
                  height: `${Math.random() * 20 + 20}px`
                }} 
              />
            ))}
          </div>

          <div className={styles.heroContent}>
            <p className={styles.heroEye}>▸ SECURE PORTAL</p>
            <h1 className={styles.heroTitle}>
              NAVIGATE<br />YOUR<br />
              <span className={styles.heroOrange}>CAMPUS</span><br />LIFE
            </h1>
            <p className={styles.heroSubtitle}>
              Access facilities, manage bookings, and stay connected — all in one place built for students.
            </p>
          </div>

          {/* Character on orange circle */}
          <div className={styles.heroArt}>
            <div className={styles.heroCircle}>
              <img src="/adventurer-3d.png" alt="Adventurer" className={styles.hero3dImg} />
            </div>
          </div>

          {/* Bottom stats strip */}
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><strong>124+</strong><span>Facilities</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>16+</strong><span>Departments</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>20+</strong><span>Years</span></div>
          </div>
        </div>

        {/* RIGHT — white form panel */}
        <div className={styles.rightPane}>
          <div className={styles.formBox}>
            <p className={styles.formEye}>▸ WELCOME BACK</p>
            <h2 className={styles.formTitle}>SIGN IN TO<br /><span className={styles.formOrange}>YOUR HUB</span></h2>
            <p className={styles.formDesc}>Enter your university credentials to access the operations platform.</p>

            {(error || oauthError) && (
              <div className={styles.errorBanner}>
                {error
                  ? error
                  : oauthError === 'oauth_failed'
                  ? 'Google sign-in was cancelled.'
                  : oauthDetail
                  ? `Authentication failed: ${oauthDetail}`
                  : 'Authentication failed. Please try again.'}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>UNIVERSITY EMAIL</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="you@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>PASSWORD</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                {isSubmitting ? <><div className={styles.btnSpinner} /> Signing in...</> : 'Sign In →'}
              </button>
            </form>

            <div className={styles.divider}><span>OR</span></div>

            <button className={styles.googleBtn} onClick={handleGoogleLogin} disabled={isRedirecting}>
              {isRedirecting ? <div className={styles.btnSpinner} /> : <><GoogleIcon /> Continue with Google</>}
            </button>

            <p className={styles.switchLink}>
              Don't have an account? <Link to="/register" className={styles.link}>Create one →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
