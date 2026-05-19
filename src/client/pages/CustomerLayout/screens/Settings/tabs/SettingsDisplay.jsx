import React from "react";
import { useLanguage } from "../../../../../i18n/LanguageContext";
import styles from "./SettingsDisplay.module.css";

export default function SettingsDisplay() {
  const { language, setLanguage, t } = useLanguage();

  const langOptions = [
    { value: "vi", label: t("settings.langVi") },
    { value: "en", label: t("settings.langEn") },
  ];

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("settings.languageTitle")}</h2>
        <p className={styles.sectionDesc}>{t("settings.languageDesc")}</p>

        <div className={styles.langGrid}>
          {langOptions.map((opt) => {
            const active = language === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLanguage(opt.value)}
                className={`${styles.langCard} ${
                  active ? styles.langCardActive : ""
                }`}
              >
                <span className={styles.langCode}>
                  {opt.value.toUpperCase()}
                </span>
                <span className={styles.langLabel}>{opt.label}</span>
                <span
                  className={`${styles.radioDot} ${
                    active ? styles.radioDotActive : ""
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
