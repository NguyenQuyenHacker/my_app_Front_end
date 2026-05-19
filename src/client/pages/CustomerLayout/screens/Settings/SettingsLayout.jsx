import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { User, Shield, Languages } from "lucide-react";
import { useT } from "../../../../i18n/LanguageContext";
import styles from "./SettingsLayout.module.css";

export default function SettingsLayout() {
  const t = useT();

  const tabs = [
    { to: "profile", label: t("settings.tabProfile"), Icon: User },
    { to: "security", label: t("settings.tabSecurity"), Icon: Shield },
    { to: "display", label: t("settings.tabLanguage"), Icon: Languages },
  ];

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>{t("settings.pageTitle")}</h1>

      <div className={styles.container}>
        <aside className={styles.tabNav}>
          <ul>
            {tabs.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `${styles.tabLink} ${isActive ? styles.tabActive : ""}`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        <section className={styles.content}>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
