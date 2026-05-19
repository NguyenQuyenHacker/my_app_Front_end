import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  PieChart,
  Wallet,
  Repeat,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { clearClientToken } from "../../../utils/authUtils";
import { getCustomerInfo } from "../../api/userApi";
import { useT } from "../../i18n/LanguageContext";

const getInitials = (name) => {
  if (!name) return "KH";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Sidebar = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const t = useT();
  const [user, setUser] = useState(null);
  const [openGroup, setOpenGroup] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getCustomerInfo();
        if (!cancelled) setUser(result);
      } catch {
        // im lặng — sidebar vẫn render với placeholder
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    clearClientToken();
    navigate("/login");
  };

  const toggleGroup = (key) =>
    setOpenGroup((prev) => (prev === key ? null : key));

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>


      <div className={styles.profile}>
        <div className={styles.avatar}>{getInitials(user?.full_name)}</div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>
            {user?.full_name || t("sidebar.customer")}
          </div>
          <NavLink to="/customer/infor" className={styles.profileLink}>
            {t("sidebar.profileLink")}
          </NavLink>
        </div>
      </div>

      <nav className={styles.navigation}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <NavLink
              to="/customer/home-page"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              <PieChart size={20} className={styles.navIcon} />
              <span className={styles.linkText}>{t("sidebar.home")}</span>
            </NavLink>
          </li>

          <li className={styles.navItem}>
            <NavLink
              to="/customer/accounts"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              <Wallet size={20} className={styles.navIcon} />
              <span className={styles.linkText}>{t("sidebar.accountsCards")}</span>
            </NavLink>
          </li>

          <li className={styles.navItem}>
            <button
              type="button"
              className={`${styles.navLink} ${styles.groupTrigger} ${
                openGroup === "transfer" ? styles.groupOpen : ""
              }`}
              onClick={() => toggleGroup("transfer")}
            >
              <Repeat size={20} className={styles.navIcon} />
              <span className={styles.linkText}>{t("sidebar.transfer")}</span>
              <ChevronDown size={18} className={styles.chevron} />
            </button>
            {openGroup === "transfer" && (
              <ul className={styles.subList}>
                <li>
                  <NavLink
                    to="/customer/transfer"
                    className={({ isActive }) =>
                      `${styles.subLink} ${isActive ? styles.subActive : ""}`
                    }
                  >
                    {t("sidebar.quickTransfer")}
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          <li className={styles.navItem}>
            <button
              type="button"
              className={`${styles.navLink} ${styles.groupTrigger} ${
                openGroup === "more" ? styles.groupOpen : ""
              }`}
              onClick={() => toggleGroup("more")}
            >
              <MoreHorizontal size={20} className={styles.navIcon} />
              <span className={styles.linkText}>{t("sidebar.otherFeatures")}</span>
              <ChevronDown size={18} className={styles.chevron} />
            </button>
            {openGroup === "more" && (
              <ul className={styles.subList}>
                <li>
                  <NavLink
                    to="/customer/settings"
                    className={({ isActive }) =>
                      `${styles.subLink} ${isActive ? styles.subActive : ""}`
                    }
                  >
                    {t("sidebar.settings")}
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <div className={styles.bottomSection}>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          {t("sidebar.logout")}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
