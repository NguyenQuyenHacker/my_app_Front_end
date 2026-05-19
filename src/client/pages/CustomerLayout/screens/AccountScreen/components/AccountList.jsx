import React from "react";
import styles from "./AccountList.module.css";
import { useT } from "../../../../../i18n/LanguageContext";

const AccountList = ({ account }) => {
  const t = useT();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t("account.listTitle")}</h3>
        <span className={styles.badge}>{account.bank_name}</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.label}>{t("account.listAccountNo")}</span>
          <strong>{account.account_no}</strong>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>{t("account.listBank")}</span>
          <strong>{account.bank_name}</strong>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>{t("account.listCurrency")}</span>
          <strong>{account.currency}</strong>
        </div>

        <div className={styles.item}>
          <span className={styles.label}>{t("account.listStatus")}</span>
          <strong>{account.status}</strong>
        </div>
      </div>
    </div>
  );
};

export default AccountList;
