import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RegisterFormData } from '../types/auth';
import styles from './Register.module.css';

interface FieldErrors {
  name?: string;
  studentId?: string;
  department?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function Register() {
  const { login, registerWithPassword } = useAuth();

  const [form, setForm] = useState<RegisterFormData>({
    name: '',
    studentId: '',
    department: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FieldErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!form.name.trim()) newErrors.name = 'Required';
    if (!form.studentId.trim()) newErrors.studentId = 'Required';
    if (!form.department.trim()) newErrors.department = 'Required';
    if (!form.email.trim()) newErrors.email = 'Required';
    if (!form.password) newErrors.password = 'Required';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Required';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Must match password';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      await registerWithPassword(form);
    } catch (err: unknown) {
      const apiErr = err as Error & { status?: number; errors?: string[] };
      if (apiErr.status === 409) {
        setErrors({ general: 'Account already exists.' });
      } else if (apiErr.status === 400 && apiErr.errors?.length) {
        setErrors({ general: apiErr.errors.join(' ') });
      } else {
        setErrors({ general: apiErr.message || 'Registration failed.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = () => {
    setIsGoogleRedirecting(true);
    login();
  };

  return (
    <div className={styles.container}>
      <div className={styles.splitTitleContainer}>
        <div className={styles.titleLeft}>
          <div className={styles.subtextLeft}>NEW MEMBER</div>
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
           <span className={styles.tagline}>CREATE YOUR FUTURE</span>
        </div>
        
        <div className={styles.formContainer}>
          <p className={styles.formDesc}>
            Join the platform today to unlock seamless campus management and explore new possibilities.
          </p>

          {errors.general && (
            <div className={styles.errorBanner}>{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.row}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="name"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="studentId"
                  className={`${styles.input} ${errors.studentId ? styles.inputError : ''}`}
                  placeholder="Student ID"
                  value={form.studentId}
                  onChange={handleChange}
                />
                {errors.studentId && <span className={styles.fieldError}>{errors.studentId}</span>}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="department"
                  className={`${styles.input} ${errors.department ? styles.inputError : ''}`}
                  placeholder="Department"
                  value={form.department}
                  onChange={handleChange}
                />
                {errors.department && <span className={styles.fieldError}>{errors.department}</span>}
              </div>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  name="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputWrapper}>
                <input
                  type="password"
                  name="password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />
                {errors.password ? (
                  <span className={styles.fieldError}>{errors.password}</span>
                ) : (
                  <span className={styles.hint}>Min 8 chars</span>
                )}
              </div>
              <div className={styles.inputWrapper}>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className={styles.actionRow}>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? <><div className={styles.spinner} /> REGISTERING</> : 'CREATE ACCOUNT \u2192'} 
              </button>
              
              <button
                type="button"
                className={styles.googleIconBtn}
                onClick={handleGoogleRegister}
                disabled={isGoogleRedirecting}
              >
                {isGoogleRedirecting ? <div className={styles.spinner} /> : <><GoogleIcon /> Google</>}
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
          <Link to="/login">LOGIN</Link>
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
