import React from "react";
import styles from "./TransactionList.module.css";
import { useLanguage } from "../../../../../i18n/LanguageContext";

const formatAmount = (value, locale) =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0,
  }).format(Math.abs(Number(value || 0)));

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dayLabel = (iso, locale, t) => {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(d, now)) return t("account.today") || "Hôm nay";
  if (isSameDay(d, yesterday)) return t("account.yesterday") || "Hôm qua";

  return d.toLocaleDateString(locale === "en" ? "en-US" : "vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const ArrowUpLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="17" x2="7" y2="7" />
    <polyline points="17 7 7 7 7 17" />
  </svg>
);

const ArrowDownRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="7" x2="17" y2="17" />
    <polyline points="17 7 17 17 7 17" />
  </svg>
);

const TransactionList = ({ entries = [] }) => {
  const { language, t } = useLanguage();

  if (!entries.length) {
    return <div className={styles.empty}>{t("account.txEmpty")}</div>;
  }

  const groups = [];
  let currentKey = null;
  entries.forEach((item) => {
    const key = new Date(item.created_at).toDateString();
    if (key !== currentKey) {
      groups.push({ key, label: dayLabel(item.created_at, language, t), items: [] });
      currentKey = key;
    }
    groups[groups.length - 1].items.push(item);
  });

  return (
    <div className={styles.list}>
      {groups.map((group) => (
        <div key={group.key} className={styles.dayGroup}>
          <div className={styles.dayLabel}>{group.label}</div>

          {group.items.map((e) => {
            const direction = e.direction || (Number(e.amount) > 0 ? "IN" : "OUT");
            const isIn = direction === "IN";
            const status = e.status;
            const isFailed = status === "FAILED";
            const isPending = status === "PENDING" || status === "PROCESSING";

            const iconClass = isFailed
              ? `${styles.iconWrap} ${styles.failed}`
              : isIn
              ? `${styles.iconWrap} ${styles.in}`
              : styles.iconWrap;

            const amountClass = isIn ? `${styles.amount} ${styles.income}` : styles.amount;
            const sign = isIn ? "+ " : "- ";
            const name = (e.counterparty_name || e.note || t("account.txDefault")).trim();
            const desc = e.description || "";

            return (
              <div key={e.transaction_id || e.entry_id} className={styles.item}>
                <div className={iconClass}>{isIn ? <ArrowDownRight /> : <ArrowUpLeft />}</div>

                <div className={styles.body}>
                  <p className={styles.name}>
                    <span>{name || t("account.txDefault")}</span>
                    {isPending && (
                      <span className={`${styles.statusBadge} ${styles.statusProcessing}`}>
                        {t("account.statusProcessing") || "Đang xử lý"}
                      </span>
                    )}
                    {isFailed && (
                      <span className={`${styles.statusBadge} ${styles.statusFailed}`}>
                        {t("account.statusFailed") || "Thất bại"}
                      </span>
                    )}
                  </p>
                  <p className={styles.desc}>{desc}</p>
                </div>

                <div className={amountClass}>
                  {sign}
                  {formatAmount(e.amount, language)}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
