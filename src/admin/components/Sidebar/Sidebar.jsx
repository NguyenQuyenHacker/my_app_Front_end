//src/admin/components/Sidebar/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  CreditCard, 
  ArrowRightLeft, 
  Settings, 
  LogOut,
  ChevronDown
} from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    accounts: true // Default expanded for demo
  });

  const handleLogout = () => {
    localStorage.removeItem("admin_access_token");
    navigate("/admin/login");
  };

  const toggleSubmenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <nav className={styles.navigation}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
             <NavLink
              to="/admin/overviews"
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
              to="/admin/customers"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.navLinkContent}>
                <Users size={20} />
                <span className={styles.linkText}>Khách hàng</span>
              </div>
            </NavLink>
          </li>

          {/* Accounts Submenu */}
          <li className={`${styles.navItem} ${expandedMenus.accounts ? styles.expanded : ""}`}>
            <div 
              className={`${styles.navLink} ${location.pathname.includes('/admin/accounts') ? styles.active : ""}`}
              onClick={() => toggleSubmenu('accounts')}
            >
              <div className={styles.navLinkContent}>
                <Wallet size={20} />
                <span className={styles.linkText}>Tài khoản</span>
              </div>
              <ChevronDown size={16} className={styles.chevron} />
            </div>
            
            {!collapsed && expandedMenus.accounts && (
              <ul className={styles.submenu}>
                <li className={styles.submenuItem}>
                  <NavLink
                    to="/admin/accounts/list"
                    className={({ isActive }) => `${styles.submenuLink} ${isActive ? styles.submenuActive : ""}`}
                  >
                    <span className={styles.submenuTitle}>Danh sách TK</span>
                    <span className={styles.submenuDesc}>Quản lý tất cả tài khoản</span>
                  </NavLink>
                </li>
                <li className={styles.submenuItem}>
                  <NavLink
                    to="/admin/accounts/pending"
                    className={({ isActive }) => `${styles.submenuLink} ${isActive ? styles.submenuActive : ""}`}
                  >
                    <span className={styles.submenuTitle}>Duyệt mở TK</span>
                    <span className={styles.submenuDesc}>Phê duyệt tài khoản mới</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          <li className={styles.navItem}>
             <NavLink
              to="/admin/cards"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.navLinkContent}>
                <CreditCard size={20} />
                <span className={styles.linkText}>Thẻ</span>
              </div>
            </NavLink>
          </li>

          <li className={styles.navItem}>
             <NavLink
              to="/admin/transactions"
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.navLinkContent}>
                <ArrowRightLeft size={20} />
                <span className={styles.linkText}>Giao dịch</span>
              </div>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className={styles.bottomSection}>
        <NavLink
            to="/admin/settings"
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