import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RegisterFormData } from '../types/auth';
import styles from './Login.module.css';

interface FieldErrors {
  name?: string; studentId?: string; department?: string;
  email?: string; password?: string; confirmPassword?: string; general?: string;
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

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

export default function Register() {
  const { login, registerWithPassword } = useAuth();
  const [form, setForm] = useState<RegisterFormData>({
    name: '', studentId: '', department: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'name') {
      value = value.replace(/[^A-Za-z\s]/g, '');
    }
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FieldErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Required';
    } else if (!/^[A-Za-z\s]+$/.test(form.name)) {
      newErrors.name = 'Only letters are allowed';
    }
    
    if (!form.studentId.trim()) {
      newErrors.studentId = 'Required';
    }
    if (!form.department.trim()) newErrors.department = 'Required';
    if (!form.email.trim()) newErrors.email = 'Required';
    if (!form.password) {
      newErrors.password = 'Required';
    } else {
      const pwdErrors: string[] = [];
      if (form.password.length < 6) pwdErrors.push('at least 6 characters');
      if (!/[A-Za-z]/.test(form.password)) pwdErrors.push('a letter');
      if (!/[0-9]/.test(form.password)) pwdErrors.push('a digit');
      if (pwdErrors.length) newErrors.password = `Must contain: ${pwdErrors.join(', ')}`;
    }
    if (!form.confirmPassword) newErrors.confirmPassword = 'Required';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Must match password';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true); setErrors({});
    try {
      await registerWithPassword(form);
    } catch (err: unknown) {
      const apiErr = err as Error & { status?: number; errors?: string[]; message?: string };
      console.error('Registration error:', { status: apiErr.status, message: apiErr.message, errors: apiErr.errors });
      if ((apiErr.status === 400 || apiErr.status === 409) && apiErr.errors?.length)
        setErrors({ general: apiErr.errors.join(' ') });
      else setErrors({ general: apiErr.message || 'Registration failed.' });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
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
        <Link to="/login" className={styles.navRegister}>Login</Link>
      </nav>

      <div className={styles.body}>
        {/* LEFT — dark green hero */}
        <div className={styles.leftPane}>
          <div className={styles.heroLeaf1} />
          <div className={styles.heroLeaf2} />
          <div className={styles.heroContent}>
            <p className={styles.heroEye}>▸ NEW MEMBER</p>
            <h1 className={styles.heroTitle}>
              CREATE<br />YOUR<br />
              <span className={styles.heroOrange}>CAMPUS</span><br />ACCOUNT
            </h1>
            <p className={styles.heroSubtitle}>
              Join thousands of students already using SmartCampus to manage facilities, bookings, and campus life.
            </p>
          </div>

          <div className={styles.heroArt}>
            <div className={styles.heroCircle}>
              <img src="/adventurer-3d.png" alt="Adventurer" className={styles.hero3dImg} />
            </div>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}><strong>Free</strong><span>Always</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>60s</strong><span>To Sign Up</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>All</strong><span>Facilities</span></div>
          </div>
        </div>

        {/* RIGHT — white form */}
        <div className={styles.rightPane}>
          <div className={styles.formBox}>
            <p className={styles.formEye}>▸ GET STARTED</p>
            <h2 className={styles.formTitle}>JOIN THE<br /><span className={styles.formOrange}>HUB TODAY</span></h2>
            <p className={styles.formDesc}>Fill in your details to create your campus account instantly.</p>

            {errors.general && <div className={styles.errorBanner}>{errors.general}</div>}

            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>FULL NAME</label>
                  <input type="text" name="name" className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    placeholder="Jane Doe" value={form.name} onChange={handleChange} />
                  {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>STUDENT ID</label>
                  <input type="text" name="studentId" className={`${styles.input} ${errors.studentId ? styles.inputError : ''}`}
                    placeholder="Enter your Student ID" value={form.studentId} onChange={handleChange} />
                  {errors.studentId && <span className={styles.fieldError}>{errors.studentId}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>FACULTY / DEPARTMENT</label>
                  <select name="department" className={`${styles.input} ${errors.department ? styles.inputError : ''}`}
                    value={form.department} onChange={handleChange as any}>
                    <option value="" disabled>Select your faculty</option>
                    <option value="Faculty of Computing">Faculty of Computing</option>
                    <option value="Faculty of Engineering">Faculty of Engineering</option>
                    <option value="Faculty of Business">Faculty of Business</option>
                    <option value="Faculty of Humanities & Sciences">Faculty of Humanities & Sciences</option>
                    <option value="School of Architecture">School of Architecture</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.department && <span className={styles.fieldError}>{errors.department}</span>}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>EMAIL</label>
                  <input type="email" name="email" className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    placeholder="you@uni.edu" value={form.email} onChange={handleChange} />
                  {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>PASSWORD</label>
                  <div className={styles.inputWrapper}>
                    <input type={showPassword ? 'text' : 'password'} name="password" className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                      placeholder="Min 6 chars" value={form.password} onChange={handleChange} />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {errors.password ? <span className={styles.fieldError}>{errors.password}</span>
                    : <span className={styles.hint}>Min 6 characters, letters & digits</span>}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>CONFIRM PASSWORD</label>
                  <div className={styles.inputWrapper}>
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                      placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(p => !p)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  </div>
                  {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
                </div>
              </div>

              <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                {isSubmitting ? <><div className={styles.btnSpinner} /> Creating account...</> : 'Create Account →'}
              </button>
            </form>

            <div className={styles.divider}><span>OR</span></div>

            <button className={styles.googleBtn} onClick={() => { setIsGoogleRedirecting(true); login(); }} disabled={isGoogleRedirecting}>
              {isGoogleRedirecting ? <div className={styles.btnSpinner} /> : <><GoogleIcon /> Continue with Google</>}
            </button>

            <p className={styles.switchLink}>
              Already have an account? <Link to="/login" className={styles.link}>Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
