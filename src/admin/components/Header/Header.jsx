//src/admin/components/Header/Header.jsx
import React from "react";
import { Bell, ChevronDown, Menu, User, Search, HeadphonesIcon, Settings } from "lucide-react";
import styles from "./Header.module.css";

const Header = ({ onToggleSidebar, sidebarCollapsed }) => {
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
          <Menu size={24} color="#ffffff" />
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
          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Tìm tính năng, mã CK..." className={styles.searchInput} />
          </div>

          <div className={styles.actions}>
            <div className={styles.actionItem}>
              <Settings size={20} />
              <span>Công cụ</span>
            </div>
            <div className={styles.actionItem}>
              <HeadphonesIcon size={20} />
              <span>Hỗ trợ</span>
            </div>
            <button className={`${styles.actionItem} ${styles.iconButton}`} type="button">
              <Bell size={20} />
              <span className={styles.badge}>3</span>
            </button>
          </div>

          <div className={styles.profile}>
            <div className={styles.avatar}>
              <User size={18} />
            </div>

            <div className={styles.profileText}>
              <span className={styles.name}>Admin User</span>
              <span className={styles.role}>105C439774</span>
            </div>

            <ChevronDown size={14} className={styles.chevron} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;