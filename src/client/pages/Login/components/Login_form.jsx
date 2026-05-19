import { useNavigate } from 'react-router-dom';
import styles from '../Login.module.css';
import { useT } from '../../../i18n/LanguageContext';

const LoginForm = ({ formData, handleChange, handleSubmit, loading, error }) => {
  const t = useT();
  const navigate = useNavigate();

  return (
    <section className={styles.panel}>
      <div className={styles.card}>
        <header className={styles.cardHead}>
          <h2>{t('login.formTitle')}</h2>
          <p>{t('login.formSub')}</p>
        </header>

        {error && (
          <div className={styles.errorAlert} role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={styles.input}
              placeholder=" "
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <label htmlFor="phone" className={styles.label}>
              {t('login.phone')}
            </label>
          </div>

          <div className={styles.field}>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="password" className={styles.label}>
              {t('login.password')}
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.remember}>
              <input type="checkbox" className={styles.checkbox} />
              {t('login.rememberDevice')}
            </label>

            <a href="#" className={styles.link}>{t('login.forgotPassword')}</a>
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading && <span className={styles.spinner} aria-hidden="true" />}
            {loading ? t('login.loggingIn') || 'Đang đăng nhập...' : t('login.loginBtn')}
          </button>

          <div className={styles.divider}></div>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => navigate('/signup')}
          >
            {t('login.createAccount')}
          </button>

          <p className={styles.fineprint}>
            {t('login.fineprint')}{' '}
            <a href="#" className={styles.link}>{t('login.fineprintLink')}</a>.
          </p>
        </form>
      </div>
    </section>
  );
};

export default LoginForm;
