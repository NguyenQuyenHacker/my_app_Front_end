//src/admin/components/Sidebar/Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import styles from "./Sidebar.module.css";
import { clearAdminAuth } from "../../../utils/authUtils";
import { sidebarItems, bottomItems } from "./sidebarItems";
import SidebarLinkItem from "./SidebarLinkItem";

const Sidebar = ({ collapsed = false }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminAuth();
    navigate("/admin/login");
  };

  const renderItem = (item) => {
    return (
      <SidebarLinkItem
        key={item.key}
        item={item}
        collapsed={collapsed}
      />
    );
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <nav className={styles.navigation}>
        <ul className={styles.navList}>
          {sidebarItems.map(renderItem)}
        </ul>
      </nav>

      <div className={styles.bottomSection}>
        <ul className={styles.navList}>
          {bottomItems.map(renderItem)}
        </ul>
        
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={20} />
          <span className={styles.linkText}>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;