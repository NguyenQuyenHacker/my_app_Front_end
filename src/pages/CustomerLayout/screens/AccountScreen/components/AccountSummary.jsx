import React from "react";
import styles from "./AccountSummary.module.css";

const formatMoney = (value, currency) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(Number(value || 0));

const AccountSummary = ({ fullName, account }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.caption}>Chủ tài khoản</p>
          <h2 className={styles.name}>{fullName}</h2>
          <p className={styles.subText}>
            {account.bank_name} • {account.account_no}
          </p>
        </div>

        <span
          className={`${styles.status} ${
            account.status === "ACTIVE" ? styles.active : styles.inactive
          }`}
        >
          {account.status}
        </span>
      </div>

      <div className={styles.balanceCard}>
        <span className={styles.balanceLabel}>Số dư hiện tại</span>
        <h1 className={styles.balanceValue}>
          {formatMoney(account.balance, account.currency)}
        </h1>
      </div>
    </div>
  );
};

export default AccountSummary;