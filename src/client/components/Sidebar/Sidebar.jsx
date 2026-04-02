import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  Settings, 
  LogOut,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar = ({ collapsed = false }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("customer_access_token");
    navigate("/login");
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <nav className={styles.navigation}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
             <NavLink
              to="/customer/overview"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.navLinkContent}>
                <LayoutDashboard size={20} />
                <span className={styles.linkText}>Tổng quan</span>
              </div>
            </NavLink>
          </li>

          <li className={styles.navItem}>
             <NavLink
              to="/customer/transfer"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.navLinkContent}>
                <ArrowRightLeft size={20} />
                <span className={styles.linkText}>Chuyển khoản</span>
              </div>
            </NavLink>
          </li>

          <li className={styles.navItem}>
             <NavLink
              to="/customer/accounts"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.navLinkContent}>
                <Wallet size={20} />
                <span className={styles.linkText}>Tài khoản</span>
              </div>
            </NavLink>
          </li>

        </ul>
      </nav>

      <div className={styles.bottomSection}>
        <NavLink
            to="/customer/settings"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
          >
          <div className={styles.navLinkContent}>
            <Settings size={20} />
            <span className={styles.linkText}>Cài đặt</span>
          </div>
        </NavLink>
        
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={20} />
          <span className={styles.linkText}>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
