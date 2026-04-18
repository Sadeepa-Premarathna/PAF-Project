import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ProfileCompletionData } from '../types/auth';
import styles from './Login.module.css';

interface LocationState { profileData: ProfileCompletionData; }

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

  if (!profileData) { navigate('/login', { replace: true }); return null; }

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
    setIsSubmitting(true); setErrors({});
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: profileData.name, email: profileData.email, googleSub: profileData.googleSub, studentId, department }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 409) setErrors({ general: 'An account with this email already exists.' });
        else if (res.status === 400) setErrors({ general: body.message || 'Invalid data. Please check your inputs.' });
        else setErrors({ general: 'Something went wrong. Please try again.' });
        return;
      }
      const data = await res.json();
      setAuth(data.user, data.accessToken);
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    } catch { setErrors({ general: 'Network error. Please try again.' }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <span className={styles.navDot}>●</span>
          SMART<span className={styles.navOrange}>CAMPUS</span>
        </div>
        <div className={styles.navLinks} />
      </nav>

      <div className={styles.body}>
        {/* LEFT - dark green */}
        <div className={styles.leftPane}>
          <div className={styles.heroLeaf1} />
          <div className={styles.heroLeaf2} />
          <div className={styles.heroContent}>
            <p className={styles.heroEye}>▸ ALMOST THERE</p>
            <h1 className={styles.heroTitle}>
              COMPLETE<br />YOUR<br />
              <span className={styles.heroOrange}>CAMPUS</span><br />PROFILE
            </h1>
            <p className={styles.heroSubtitle}>
              Welcome, {profileData.name.split(' ')[0]}! Just two more details and you'll have full access to SmartCampus.
            </p>
          </div>

          <div className={styles.heroArt}>
            <div className={styles.heroCircle}>
              <svg viewBox="0 0 180 240" fill="none" xmlns="http://www.w3.org/2000/svg" width="180">
                <circle cx="90" cy="72" r="30" fill="#f4c89a"/>
                <ellipse cx="90" cy="55" rx="30" ry="18" fill="#3d2300"/>
                <ellipse cx="90" cy="155" rx="40" ry="52" fill="#1a5c38"/>
                <path d="M52 120 Q20 100 30 78" stroke="#f4c89a" strokeWidth="13" strokeLinecap="round" fill="none"/>
                <path d="M128 120 Q160 100 150 78" stroke="#f4c89a" strokeWidth="13" strokeLinecap="round" fill="none"/>
                {/* Holding a checklist */}
                <rect x="22" y="62" width="22" height="28" rx="3" fill="#fff" stroke="#f97316" strokeWidth="2"/>
                <line x1="26" y1="70" x2="40" y2="70" stroke="#22c55e" strokeWidth="2"/>
                <line x1="26" y1="76" x2="40" y2="76" stroke="#22c55e" strokeWidth="2"/>
                <line x1="26" y1="82" x2="36" y2="82" stroke="#d1d5db" strokeWidth="2"/>
                <rect x="72" y="140" width="56" height="68" rx="10" fill="#c0392b"/>
                <rect x="80" y="148" width="40" height="30" rx="6" fill="#e74c3c"/>
                <path d="M82 140 Q68 158 72 182" stroke="#a93226" strokeWidth="6" strokeLinecap="round" fill="none"/>
                <path d="M118 140 Q132 158 128 182" stroke="#a93226" strokeWidth="6" strokeLinecap="round" fill="none"/>
                <ellipse cx="100" cy="138" rx="22" ry="8" fill="#f1c40f"/>
                <rect x="80" y="202" width="16" height="46" rx="8" fill="#2c5f3f"/>
                <rect x="104" y="202" width="16" height="46" rx="8" fill="#2c5f3f"/>
                <ellipse cx="88" cy="248" rx="14" ry="7" fill="#1a1a1a"/>
                <ellipse cx="112" cy="248" rx="14" ry="7" fill="#1a1a1a"/>
                <path d="M80 82 Q90 92 100 82" stroke="#d4956a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}><strong>Step</strong><span>2 of 2</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>60s</strong><span>Remaining</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>Done!</strong><span>Almost</span></div>
          </div>
        </div>

        {/* RIGHT - white form */}
        <div className={styles.rightPane}>
          <div className={styles.formBox}>
            <p className={styles.formEye}>▸ FINAL STEP</p>
            <h2 className={styles.formTitle}>YOUR<br /><span className={styles.formOrange}>DETAILS</span></h2>
            <p className={styles.formDesc}>Your Google account has been verified. Add your student info to complete setup.</p>

            {errors.general && <div className={styles.errorBanner}>{errors.general}</div>}

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>FULL NAME (FROM GOOGLE)</label>
                <input type="text" className={styles.input} value={profileData.name} readOnly />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>EMAIL (FROM GOOGLE)</label>
                <input type="email" className={styles.input} value={profileData.email} readOnly />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>STUDENT ID</label>
                <input
                  type="text" className={`${styles.input} ${errors.studentId ? styles.inputError : ''}`}
                  placeholder="e.g. AB123456" value={studentId}
                  onChange={e => { setStudentId(e.target.value); setErrors(p => ({ ...p, studentId: undefined })); }}
                  autoComplete="off"
                />
                {errors.studentId && <span className={styles.fieldError}>{errors.studentId}</span>}
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>DEPARTMENT</label>
                <input
                  type="text" className={`${styles.input} ${errors.department ? styles.inputError : ''}`}
                  placeholder="e.g. Computer Science" value={department}
                  onChange={e => { setDepartment(e.target.value); setErrors(p => ({ ...p, department: undefined })); }}
                  autoComplete="organization"
                />
                {errors.department && <span className={styles.fieldError}>{errors.department}</span>}
              </div>

              <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                {isSubmitting ? <><div className={styles.btnSpinner} /> Setting up...</> : 'Complete Setup →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
