import styles from "../Signup.module.css";
import { useT } from "../../../i18n/LanguageContext";

const STEPS_KEYS = [
  { title: "signup.step1Title", desc: "signup.step1Desc" },
  { title: "signup.step2Title", desc: "signup.step2Desc" },
  { title: "signup.step3Title", desc: "signup.step3Desc" },
];

const SignupBrand = ({ step }) => {
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
          <h1 className={styles.brandTitle}>{t("signup.brandTitle")}</h1>
          <p className={styles.brandSub}>{t("signup.brandSub")}</p>

          <ol className={styles.stepList}>
            {STEPS_KEYS.map((s, i) => {
              const idx = i + 1;
              const state =
                idx < step ? styles.stepDone : idx === step ? styles.stepActive : styles.stepPending;
              return (
                <li key={idx} className={`${styles.stepItem} ${state}`}>
                  <span className={styles.stepIndex}>{idx < step ? "✓" : idx}</span>
                  <div>
                    <div className={styles.stepTitle}>{t(s.title)}</div>
                    <div className={styles.stepDesc}>{t(s.desc)}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <footer className={styles.footBox}>
          <div className={styles.metaTitle}>{t("signup.noteTitle")}</div>
          <ul className={styles.footList}>
            <li>{t("signup.note1")}</li>
            <li>{t("signup.note2")}</li>
          </ul>
        </footer>
      </div>
    </section>
  );
};

export default SignupBrand;
