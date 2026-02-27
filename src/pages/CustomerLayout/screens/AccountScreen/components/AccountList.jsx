import React from "react";
import styles from "./AccountList.module.css";

const AccountList = ({ account }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Thông tin tài khoản</h3>

      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.label}>Số tài khoản</span>
          <strong>{account.account_no}</strong>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>Ngân hàng</span>
          <strong>{account.bank_name}</strong>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>Loại tiền</span>
          <strong>{account.currency}</strong>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>Trạng thái</span>
          <strong>{account.status}</strong>
        </div>
      </div>
    </div>
  );
};

export default AccountList;