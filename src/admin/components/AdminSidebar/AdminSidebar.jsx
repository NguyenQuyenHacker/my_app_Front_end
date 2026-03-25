import { NavLink } from "react-router-dom";
import styles from "./AdminSidebar.module.css";

export default function AdminSidebar() {
  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👥" },
    { name: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>A</div>
        <h2 className={styles.logoText}>Admin Pro</h2>
      </div>

      <nav className={styles.navMenu}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>T</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>Techcombank</p>
            <p className={styles.userRole}>Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
