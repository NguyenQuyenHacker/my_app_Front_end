//src/admin/pages/AdminLayout/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import styles from "./AdminLayout.module.css";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className={styles.layout}>
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      <div className={styles.body}>
        <Sidebar collapsed={sidebarCollapsed} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}