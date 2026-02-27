import React from "react";
import styles from "./TransactionList.module.css";

const formatMoney = (value, currency) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(Number(value || 0));

const formatDateTime = (value) => new Date(value).toLocaleString("vi-VN");

const TransactionList = ({ entries = [], currency = "VND" }) => {
  if (!entries.length) {
    return <div className={styles.empty}>Chưa có giao dịch nào.</div>;
  }

  return (
    <div className={styles.list}>
      {entries.map((e) => {
        const amountNum = Number(e.amount || 0);
        const isIncome = amountNum > 0;

        return (
          <div key={e.entry_id} className={styles.item}>
            <div className={styles.left}>
              <p className={styles.note}>{e.note || "Giao dịch"}</p>
              <span className={styles.time}>{formatDateTime(e.created_at)}</span>
            </div>

            <div className={styles.right}>
              <span
                className={`${styles.amount} ${
                  isIncome ? styles.income : styles.expense
                }`}
              >
                {isIncome ? "+" : ""}
                {formatMoney(amountNum, currency)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;