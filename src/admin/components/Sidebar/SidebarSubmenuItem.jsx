import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import styles from "./Sidebar.module.css";

const SidebarSubmenuItem = ({ item, collapsed, isExpanded, onToggle }) => {
  const Icon = item.icon;
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.basePath || item.key);

  return (
    <li className={`${styles.navItem} ${isExpanded ? styles.expanded : ""}`}>
      <div 
        className={`${styles.navLink} ${isActive ? styles.active : ""}`}
        onClick={() => onToggle(item.key)}
      >
        <div className={styles.navLinkContent}>
          <Icon size={20} />
          <span className={styles.linkText}>{item.label}</span>
        </div>
        <ChevronDown size={16} className={styles.chevron} />
      </div>
      
      {!collapsed && isExpanded && (
        <ul className={styles.submenu}>
          {item.children.map((child, index) => (
            <li key={index} className={styles.submenuItem}>
              <NavLink
                to={child.to}
                className={({ isActive }) => 
                  `${styles.submenuLink} ${isActive ? styles.submenuActive : ""}`
                }
              >
                <span className={styles.submenuTitle}>{child.label}</span>
                {child.desc && <span className={styles.submenuDesc}>{child.desc}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarSubmenuItem;
