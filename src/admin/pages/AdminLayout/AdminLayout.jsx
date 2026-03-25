import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import AdminHeader from "../../components/AdminHeader/AdminHeader";
import "../../styles/admin-globals.css";
import styles from "./AdminLayout.module.css";

export default function AdminLayout() {
  return (
    <div className={`admin-body-reset ${styles.layoutWrapper}`}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader />
        <main className={styles.pageContainer}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
