//src/admin/components/Header/Header.jsx
import React from "react";
import { Bell, ChevronDown, Menu, User, Search, HeadphonesIcon, Settings } from "lucide-react";
import styles from "./Header.module.css";
import { useAdmin } from "../../context/AdminContext";

const Header = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { adminName, adminCode } = useAdmin();
  return (
    <header className={styles.header}>
      <div className={`${styles.left} ${sidebarCollapsed ? styles.leftCollapsed : ''}`}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          title={sidebarCollapsed ? "Mở sidebar" : "Thu gọn sidebar"}
        >
          <Menu size={22} />
        </button>
      </div>

      <div className={styles.headerMain}>
        <div className={styles.brand}>
          <img
            src="https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg"
            alt="Techcombank Logo"
            className={styles.logo}
          />
        </div>

        <div className={styles.right}>




          <div className={styles.profile}>
            <div className={styles.avatar}>
              <User size={18} />
            </div>

            <div className={styles.profileText}>
              <span className={styles.name}>{adminName}</span>
              <span className={styles.role}>{adminCode}</span>
            </div>

            <ChevronDown size={14} className={styles.chevron} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;