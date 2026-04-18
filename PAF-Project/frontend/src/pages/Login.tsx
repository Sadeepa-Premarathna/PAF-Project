import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const { login, loginWithPassword, isAuthenticated, isLoading } = useAuth();
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
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGoogleLogin = () => {
    setIsRedirecting(true);
    login();
  };

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
      <div className={styles.container}>
        <div className={styles.leftPane}>
          <div className={styles.spinner} />
          <p style={{ marginTop: '16px' }}>Preparing the Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Absolute Centered Splitting Text */}
      <div className={styles.splitTitleContainer}>
        <div className={styles.titleLeft}>
          <div className={styles.subtextLeft}>SECURE PORTAL</div>
          SMA<br/>
          <span className={styles.titleWord2Left}>OPE</span>
        </div>
        <div className={styles.titleRight}>
          RT<br/>
          RATIONS
        </div>
      </div>

      <div className={styles.leftPane}>
        <div className={styles.navHeaderLeft}>
           <span className={styles.logo}>SMART<span className={styles.logoHighlight}>CAMPUS</span></span>
           <span className={styles.tagline}>YOU CAN MANAGE YOUR LIFE</span>
        </div>
        
        <div className={styles.formContainer}>
          <p className={styles.formDesc}>
            There is a moment in the life of any aspiring administrator that it is time to access the primary operations hub to navigate the campus system.
          </p>

          {(error || oauthError) && (
            <div className={styles.errorBanner}>
              {error
                ? error
                : oauthError === 'oauth_failed'
                ? 'Google sign-in cancelled.'
                : oauthDetail
                ? `Authentication failed: ${oauthDetail}`
                : 'Authentication failed.'}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                className={styles.input}
                placeholder="University Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                className={styles.input}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            
            <div className={styles.actionRow}>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? <><div className={styles.spinner} /> AUTHENTICATING</> : 'SESSION LOGIN \u2192'} 
              </button>
              
              <button
                type="button"
                className={styles.googleIconBtn}
                onClick={handleGoogleLogin}
                disabled={isRedirecting}
              >
                {isRedirecting ? <div className={styles.spinner} /> : <><GoogleIcon /> Google</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.rightPane}>
        <div className={styles.navHeaderRight}>
          <Link to="/">HOME</Link>
          <Link to="/about">ABOUT</Link>
          <Link to="/services">SERVICES</Link>
          <Link to="/register">SIGN UP</Link>
        </div>

        <div className={styles.bottomControls}>
          <div className={`${styles.arrowBox} ${styles.arrowBoxDark}`}>&larr;</div>
          <div className={styles.arrowBox}>&rarr;</div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
