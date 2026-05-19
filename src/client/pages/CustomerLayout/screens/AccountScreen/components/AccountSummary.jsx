import React from "react";
import styles from "./AccountSummary.module.css";
import { useLanguage } from "../../../../../i18n/LanguageContext";

const formatMoney = (value, currency, locale) =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    style: "currency",
    currency,
  }).format(Number(value || 0));

const AccountSummary = ({ fullName, account }) => {
  const { language, t } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.brandBar}>
        <span className={styles.brandName}>Techcombank</span>
        <span
          className={`${styles.status} ${
            account.status === "ACTIVE" ? styles.active : styles.inactive
          }`}
        >
          {account.status}
        </span>
      </div>

      <div className={styles.body}>
        <p className={styles.caption}>{t("account.summaryHolder")}</p>
        <h2 className={styles.name}>{fullName}</h2>
        <p className={styles.subText}>
          {account.bank_name} • {account.account_no}
        </p>

        <div className={styles.balanceCard}>
          <span className={styles.balanceLabel}>{t("account.summaryBalance")}</span>
          <h1 className={styles.balanceValue}>
            {formatMoney(account.balance, account.currency, language)}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
