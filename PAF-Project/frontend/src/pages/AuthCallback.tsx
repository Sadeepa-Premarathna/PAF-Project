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

    if (error || !code) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

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
          if (data.user.role === 'ADMIN') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
          return;
        }
        navigate('/login?error=auth_failed', { replace: true });
      })
      .catch(() => {
        navigate('/login?error=auth_failed', { replace: true });
      });
  }, [navigate, setAuth]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Signing you in...</p>
    </div>
  );
}
