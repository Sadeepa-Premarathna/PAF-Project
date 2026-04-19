import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser, Role, RegisterFormData } from '../types/auth';
import { authStore } from '../store/authStore';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  setAuth: (user: AuthUser, token: string) => void;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  registerWithPassword: (data: RegisterFormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI as string;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

function redirectByRole(role: Role, navigate: ReturnType<typeof useNavigate>) {
  if (role === 'ADMIN') {
    navigate('/admin', { replace: true });
  } else {
    navigate('/dashboard', { replace: true });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session on page load using refresh token cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          authStore.setAccessToken(data.accessToken);
          setToken(data.accessToken);

          const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
            credentials: 'include',
          });
          if (meRes.ok) {
            const userData = await meRes.json();
            setUser(userData);
          }
        }
      } catch {
        // No valid session — user needs to login
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: authStore.getAccessToken()
          ? { Authorization: `Bearer ${authStore.getAccessToken()}` }
          : {},
      });
    } finally {
      authStore.clearTokens();
      setUser(null);
      window.location.href = '/login';
    }
  };

  const setAuth = (userData: AuthUser, newToken: string) => {
    authStore.setAccessToken(newToken);
    setToken(newToken);
    setUser(userData);
  };

  const loginWithPassword = async (email: string, password: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 401) {
      throw new Error('Invalid email or password');
    }
    if (res.status === 403) {
      throw new Error('Your account has been deactivated. Contact support.');
    }
    if (!res.ok) {
      throw new Error('Login failed. Please try again.');
    }

    const data = await res.json();
    setAuth(data.user, data.accessToken);
    redirectByRole(data.user.role, navigate);
  };

  const registerWithPassword = async (formData: RegisterFormData): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...payload } = formData;

    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const err = new Error(body.message || 'Registration failed') as Error & { status: number; errors?: string[] };
      err.status = res.status;
      err.errors = body.errors;
      throw err;
    }

    const data = await res.json();
    setAuth(data.user, data.accessToken);
    redirectByRole(data.user.role, navigate);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      setAuth,
      loginWithPassword,
      registerWithPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireRole(roles: Role[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return roles.includes(user.role);
}
