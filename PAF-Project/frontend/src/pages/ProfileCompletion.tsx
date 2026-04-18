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
        body: JSON.stringify({ name: profileData.name, email: profileData.email, googleSub: profileData.googleSub, studentId: studentId.trim(), department: department.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 409) setErrors({ general: body.message || 'This data is already registered to another account.' });
        else if (res.status === 400) setErrors({ general: body.message || 'Invalid data. Please check your inputs.' });
        else setErrors({ general: body.message || 'Something went wrong. Please try again.' });
        return;
      }
      const data = await res.json();
      setAuth(data.user, data.accessToken);
      if (data.user.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (data.user.role === 'STAFF_MEMBER') navigate('/staff', { replace: true });
      else navigate('/dashboard', { replace: true });
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
              <img src="/adventurer-3d.png" alt="Adventurer" className={styles.hero3dImg} />
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
                  placeholder="Enter your Student ID"
                  value={studentId}
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
