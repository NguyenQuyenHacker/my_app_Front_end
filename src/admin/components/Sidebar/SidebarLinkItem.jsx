import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const SidebarLinkItem = ({ item, collapsed }) => {
  const Icon = item.icon;

  return (
    <li className={styles.navItem}>
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `${styles.navLink} ${isActive ? styles.active : ""}`
        }
      >
        <div className={styles.navLinkContent}>
          <Icon size={20} />
          <span className={styles.linkText}>{item.label}</span>
        </div>
      </NavLink>
    </li>
  );
};

export default SidebarLinkItem;
