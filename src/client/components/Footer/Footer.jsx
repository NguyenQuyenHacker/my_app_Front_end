import React from "react";
import { Facebook, Linkedin, Youtube } from "lucide-react";
import styles from "./Footer.module.css";
import { useT } from "../../i18n/LanguageContext";

const TCB_LOGO_URL =
  "https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg";

export default function Footer() {
  const t = useT();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.contactBlock}>
          <h4 className={styles.contactTitle}>
            <span>{t("footer.contact")}</span>
            <img
              src={TCB_LOGO_URL}
              alt="Techcombank"
              className={styles.contactLogo}
            />
          </h4>

          <div className={styles.phone}>{t("footer.phone")}</div>
          <div className={styles.line}>{t("footer.email")}</div>
          <div className={styles.line}>{t("footer.address")}</div>
          <div className={styles.line}>{t("footer.swift")}</div>

          <div className={styles.socials}>
            <a href="#facebook" className={styles.socialBtn} aria-label="Facebook">
              <Facebook size={16} strokeWidth={2.5} />
            </a>
            <a href="#linkedin" className={styles.socialBtn} aria-label="LinkedIn">
              <Linkedin size={16} strokeWidth={2.5} />
            </a>
            <a href="#youtube" className={styles.socialBtn} aria-label="YouTube">
              <Youtube size={16} strokeWidth={2.5} />
            </a>
            <a
              href="#zalo"
              className={`${styles.socialBtn} ${styles.socialZalo}`}
              aria-label="Zalo"
            >
              Zalo
            </a>
          </div>
        </div>

        <div className={styles.copyright}>{t("footer.copyright")}</div>
      </div>
    </footer>
  );
}
