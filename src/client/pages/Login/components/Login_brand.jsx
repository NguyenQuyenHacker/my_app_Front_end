import styles from '../Login.module.css';
import { useT } from '../../../i18n/LanguageContext';

const Login_brand = () => {
  const t = useT();

  return (
    <section className={styles.brand}>
      <div className={styles.brandOverlay}></div>

      <div className={styles.brandInner}>
        <header className={styles.logoRow}>
          <img
            src="https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg"
            alt="Techcombank Logo"
            className={styles.logo}
          />
        </header>

        <div className={styles.brandContent}>
          <h1 className={styles.brandTitle}>{t('login.brandTitle')}</h1>

          <p className={styles.brandSub}>{t('login.brandSub')}</p>

          <div className={styles.metaCards}>
            <div className={styles.metaCard}>
              <div className={styles.metaTitle}>{t('login.cardTransfer')}</div>
              <div className={styles.metaDesc}>{t('login.cardTransferDesc')}</div>
            </div>

            <div className={styles.metaCard}>
              <div className={styles.metaTitle}>{t('login.cardPayment')}</div>
              <div className={styles.metaDesc}>{t('login.cardPaymentDesc')}</div>
            </div>

            <div className={styles.metaCard}>
              <div className={styles.metaTitle}>{t('login.cardCard')}</div>
              <div className={styles.metaDesc}>{t('login.cardCardDesc')}</div>
            </div>
          </div>
        </div>

        <footer className={styles.footBox}>
          <div className={styles.metaTitle}>{t('login.noteTitle')}</div>

          <ul className={styles.footList}>
            <li>{t('login.note1')}</li>
            <li>{t('login.note2')}</li>
          </ul>
        </footer>
      </div>
    </section>
  );
};

export default Login_brand;
