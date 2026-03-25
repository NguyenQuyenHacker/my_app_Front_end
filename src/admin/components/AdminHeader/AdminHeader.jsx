import styles from "./AdminHeader.module.css";

export default function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input 
          type="text" 
          placeholder="Search everywhere..." 
          className={styles.searchInput} 
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton}>🔔<span className={styles.badge}>3</span></button>
        <button className={styles.iconButton}>✉️</button>
        <div className={styles.divider}></div>
        <button className={styles.profileBtn}>
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="User" />
        </button>
      </div>
    </header>
  );
}
