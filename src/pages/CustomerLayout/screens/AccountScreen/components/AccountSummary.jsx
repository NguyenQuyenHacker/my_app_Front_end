import React from "react";
import styles from "./AccountSummary.module.css";

function formatMoney(value, currency = "VND") {
  if (value === null || value === undefined) return "--";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AccountSummary({ accounts }) {
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((item) => item.status === "ACTIVE").length;
  const totalBalance = accounts.reduce((sum, item) => sum + (item.balance || 0), 0);

  return (
    <section className={styles.summaryCard}>
      <div className={styles.glow} />

      <div className={styles.content}>
        <div className={styles.leftBlock}>
          <p className={styles.eyebrow}>Tài khoản ngân hàng</p>
          <h2 className={styles.title}>Quản lý tài khoản</h2>
          <p className={styles.subtitle}>
            Theo dõi số dư, trạng thái và thông tin chi tiết các tài khoản của khách hàng.
          </p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Tổng tài khoản</span>
            <span className={styles.statValue}>{totalAccounts}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statLabel}>Đang hoạt động</span>
            <span className={styles.statValue}>{activeAccounts}</span>
          </div>

          <div className={styles.statItemWide}>
            <span className={styles.statLabel}>Tổng số dư</span>
            <span className={styles.balanceValue}>{formatMoney(totalBalance)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}