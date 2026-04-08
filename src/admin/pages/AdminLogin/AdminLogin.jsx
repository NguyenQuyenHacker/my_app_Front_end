//src/admin/pages/AdminLogin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, CircleHelp } from 'lucide-react';
import styles from './AdminLogin.module.css';
import { loginAdmin } from '../../api/adminApi';
import { setAdminToken } from '../../../utils/authUtils';
import { useAdmin } from '../../context/AdminContext';

const AdminLogin = () => {
  const { fetchAdminMe } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await loginAdmin(email, password);

      if (data?.access_token) {
        setAdminToken(data.access_token);
        // Sync fresh data from backend via context
        await fetchAdminMe();
        navigate('/admin/overviews');
      } else {
        throw new Error('No access token received');
      }
    } catch (err) {
      // Unified error message for security
      let errorMessage = err?.response?.data?.detail || 'Invalid email or password';
      
      if (errorMessage === "ADMIN_LOCKED") {
        errorMessage = "Tài khoản quản trị đã bị vô hiệu hóa. Vui lòng liên hệ Quản trị viên hệ thống để được hỗ trợ.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGrid} />

      <header className={styles.header}>
        <div className={styles.brand}>
          <img
            src="https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg"
            alt="Techcombank Logo"
            className={styles.logo}
          />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>Admin Portal</span>
            <span className={styles.brandSub}>Internal management system</span>
          </div>
        </div>

        <div className={styles.headerIcons}>
          <button type="button" className={styles.iconButton} aria-label="Language">
            <Globe className={styles.icon} size={18} strokeWidth={1.8} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Help">
            <CircleHelp className={styles.icon} size={18} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.loginShell}>
          <div className={styles.loginCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.title}>System Access</h2>
              <p className={styles.subtitle}>Welcome back</p>
            </div>

            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="admin-email">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@techcombank.com.vn"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label} htmlFor="admin-password">
                    Password
                  </label>
                </div>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={styles.input}
                  required
                />
              </div>

              {error && (
                <div className={styles.errorBox} role="alert">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '2px' }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.buttonContainer}>
                <button
                  type="submit"
                  className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>© 2026 Techcombank. All rights reserved.</div>
        <div className={styles.footerLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Security Standards</a>
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin;