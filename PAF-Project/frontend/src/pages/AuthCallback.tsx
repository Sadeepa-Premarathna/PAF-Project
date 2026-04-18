import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ProfileCompletionData } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI as string;

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error || !code) { navigate('/login?error=oauth_failed', { replace: true }); return; }

    fetch(`${API_BASE_URL}/api/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code, redirectUri: REDIRECT_URI }),
    })
      .then(async res => {
        if (res.status === 202) {
          const data: ProfileCompletionData = await res.json();
          navigate('/complete-profile', { replace: true, state: { profileData: data } });
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setAuth(data.user, data.accessToken);
          navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
          return;
        }
        const errBody = await res.json().catch(() => ({}));
        console.error('[AuthCallback] Backend OAuth error:', errBody);
        navigate(`/login?error=auth_failed&detail=${encodeURIComponent(errBody?.error ?? 'unknown')}`, { replace: true });
      })
      .catch((err) => {
        console.error('[AuthCallback] Network error:', err);
        navigate('/login?error=auth_failed', { replace: true });
      });
  }, [navigate, setAuth]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f2618',
      fontFamily: "'Poppins', sans-serif",
      color: 'white',
      gap: '24px',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900,
        fontSize: '28px',
        letterSpacing: '3px',
        marginBottom: '8px',
      }}>
        SMART<span style={{ color: '#f97316' }}>CAMPUS</span>
      </div>

      {/* Spinner */}
      <div style={{
        width: '48px', height: '48px',
        border: '3px solid rgba(249,115,22,0.2)',
        borderTopColor: '#f97316',
        borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />

      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>
        Signing you in...
      </p>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Poppins:wght@400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
