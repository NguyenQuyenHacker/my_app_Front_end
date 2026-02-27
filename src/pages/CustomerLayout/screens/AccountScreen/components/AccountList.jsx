import React from "react";
import styles from "./AccountList.module.css";
import AccountCard from "./AccountCard";

export default function AccountList({ accounts }) {
  if (!accounts.length) {
    return <div className={styles.emptyState}>Chưa có tài khoản nào.</div>;
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>Danh sách tài khoản</h3>
      </div>

      <div className={styles.grid}>
        {accounts.map((account) => (
          <AccountCard key={account.account_id} account={account} />
        ))}
      </div>
    </section>
  );
}