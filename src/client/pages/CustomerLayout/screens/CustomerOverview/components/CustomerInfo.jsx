import React from "react";
import styles from "./CustomerInfo.module.css";
import { formatDate } from "../../../../../utils/formatDate";

export default function CustomerInfo({ customer }) {
  if (!customer) return null;

  // Helper to get sophisticated initials for the avatar placeholder
  const getInitials = (name) => {
    if (!name) return "KH";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={styles.card}>
      {/* Left: Profile Section */}
      <div className={styles.profileSection}>
        <div className={styles.nameBlock}>
          <span className={styles.greeting}>Chủ tài khoản</span>
          <h1 className={styles.title}>{customer.full_name}</h1>
        </div>
      </div>

      {/* Right: Details Section strictly text-based */}
      <div className={styles.detailsSection}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>SỐ ĐIỆN THOẠI</span>
          <span className={styles.detailValue}>{customer.phone || "--"}</span>
        </div>
        
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>EMAIL</span>
          <span className={styles.detailValue}>{customer.email || "--"}</span>
        </div>

        <div className={`${styles.detailItem} ${styles.fullWidth}`}>
          <span className={styles.detailLabel}>ĐỊA CHỈ THƯỜNG TRÚ</span>
          <span className={styles.detailValue}>{customer.permanent_address || "--"}</span>
        </div>

        <div className={`${styles.detailItem} ${styles.fullWidth}`}>
          <span className={styles.detailLabel}>CHỖ Ở HIỆN TẠI</span>
          <span className={styles.detailValue}>{customer.current_address || "--"}</span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>NGÀY SINH</span>
          <span className={styles.detailValue}>{formatDate(customer.dob) || "--"}</span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>GIỚI TÍNH</span>
          <span className={styles.detailValue}>{customer.gender || "--"}</span>
        </div>
      </div>
    </div>
  );
}