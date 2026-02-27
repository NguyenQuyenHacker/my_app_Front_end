import React from "react";
import styles from "./AccountCard.module.css";
import { formatDate } from "../../../../../utils/formatDate";

function formatMoney(value, currency = "VND") {
  if (value === null || value === undefined) return "--";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getTypeLabel(type) {
  switch (type) {
    case "CHECKING":
      return "Thanh toán";
    case "SAVINGS":
      return "Tiết kiệm";
    case "TERM":
      return "Có kỳ hạn";
    default:
      return type;
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "ACTIVE":
      return "Đang hoạt động";
    case "FROZEN":
      return "Tạm khóa";
    case "CLOSED":
      return "Đã đóng";
    default:
      return status;
  }
}

function getStatusClass(status, styles) {
  switch (status) {
    case "ACTIVE":
      return styles.statusActive;
    case "FROZEN":
      return styles.statusFrozen;
    case "CLOSED":
      return styles.statusClosed;
    default:
      return "";
  }
}

export default function AccountCard({ account }) {
  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.accountBadge}>
          <span className="material-symbols-outlined">account_balance</span>
        </div>

        <span className={`${styles.statusBadge} ${getStatusClass(account.status, styles)}`}>
          {getStatusLabel(account.status)}
        </span>
      </div>

      <div className={styles.mainInfo}>
        <p className={styles.accountType}>{getTypeLabel(account.type)}</p>
        <h4 className={styles.accountNo}>{account.account_no}</h4>
      </div>

      <div className={styles.balanceBlock}>
        <span className={styles.balanceLabel}>Số dư hiện tại</span>
        <span className={styles.balanceValue}>
          {formatMoney(account.balance, account.currency)}
        </span>
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Loại tài khoản</span>
          <span className={styles.metaValue}>{getTypeLabel(account.type)}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Tiền tệ</span>
          <span className={styles.metaValue}>{account.currency}</span>
        </div>

        <div className={styles.metaItemFull}>
          <span className={styles.metaLabel}>Ngày mở</span>
          <span className={styles.metaValue}>{formatDate(account.opened_at)}</span>
        </div>
      </div>
    </article>
  );
}