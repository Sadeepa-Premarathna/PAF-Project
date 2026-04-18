import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ProfileCompletionData } from '../types/auth';
import styles from './Register.module.css';

interface LocationState {
  profileData: ProfileCompletionData;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export default function ProfileCompletion() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const state = location.state as LocationState | null;
  const profileData = state?.profileData;

  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [errors, setErrors] = useState<{ studentId?: string; department?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no profile data in state, redirect to login
  if (!profileData) {
    navigate('/login', { replace: true });
    return null;
  }

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!studentId.trim()) newErrors.studentId = 'Student ID is required.';
    if (!department.trim()) newErrors.department = 'Department is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          googleSub: profileData.googleSub,
          studentId,
          department,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setErrors({ general: 'An account with this email already exists.' });
        } else if (res.status === 400) {
          setErrors({ general: body.message || 'Invalid data. Please check your inputs.' });
        } else {
          setErrors({ general: 'Something went wrong. Please try again.' });
        }
        return;
      }

      const data = await res.json();
      setAuth(data.user, data.accessToken);
      const role = data.user.role;
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>🏫</div>
        <h1 className={styles.title}>Complete Your Profile</h1>
        <p className={styles.subtitle}>Just a few more details to get started</p>

        {errors.general && (
          <div className={styles.errorBanner}>{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <input
              type="text"
              className={styles.input}
              value={profileData.name}
              readOnly
              aria-label="Full name (from Google)"
              style={{ background: '#f5f5f5', color: '#888', cursor: 'not-allowed' }}
            />
          </div>

          <div className={styles.field}>
            <input
              type="email"
              className={styles.input}
              value={profileData.email}
              readOnly
              aria-label="Email (from Google)"
              style={{ background: '#f5f5f5', color: '#888', cursor: 'not-allowed' }}
            />
          </div>

          <div className={styles.field}>
            <input
              type="text"
              className={`${styles.input} ${errors.studentId ? styles.inputError : ''}`}
              placeholder="Student ID (e.g. AB123456)"
              value={studentId}
              onChange={e => {
                setStudentId(e.target.value);
                if (errors.studentId) setErrors(prev => ({ ...prev, studentId: undefined }));
              }}
              autoComplete="off"
            />
            {errors.studentId && <span className={styles.fieldError}>{errors.studentId}</span>}
          </div>

          <div className={styles.field}>
            <input
              type="text"
              className={`${styles.input} ${errors.department ? styles.inputError : ''}`}
              placeholder="Department"
              value={department}
              onChange={e => {
                setDepartment(e.target.value);
                if (errors.department) setErrors(prev => ({ ...prev, department: undefined }));
              }}
              autoComplete="organization"
            />
            {errors.department && <span className={styles.fieldError}>{errors.department}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting
              ? <><div className={styles.btnSpinner} /> Completing setup...</>
              : 'Complete setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
