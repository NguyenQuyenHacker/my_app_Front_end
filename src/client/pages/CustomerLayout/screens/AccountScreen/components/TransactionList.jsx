import React from "react";
import styles from "./TransactionList.module.css";
import { useLanguage } from "../../../../../i18n/LanguageContext";

const formatMoney = (value, currency, locale) =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    style: "currency",
    currency,
  }).format(Number(value || 0));

const formatDateTime = (value, locale) =>
  new Date(value).toLocaleString(locale === "en" ? "en-US" : "vi-VN");

const TransactionList = ({ entries = [], currency = "VND" }) => {
  const { language, t } = useLanguage();

  if (!entries.length) {
    return <div className={styles.empty}>{t("account.txEmpty")}</div>;
  }

  return (
    <div className={styles.list}>
      {entries.map((e) => {
        const amountNum = Number(e.amount || 0);
        const isIncome = amountNum > 0;

        return (
          <div key={e.entry_id} className={styles.item}>
            <div className={styles.left}>
              <div
                className={`${styles.dot} ${
                  isIncome ? styles.incomeDot : styles.expenseDot
                }`}
              />
              <div>
                <p className={styles.note}>{e.note || t("account.txDefault")}</p>
                <span className={styles.time}>{formatDateTime(e.created_at, language)}</span>
              </div>
            </div>

            <div className={styles.right}>
              <span
                className={`${styles.amount} ${
                  isIncome ? styles.income : styles.expense
                }`}
              >
                {isIncome ? "+" : ""}
                {formatMoney(amountNum, currency, language)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
