import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./CustomerService.module.css";
import { useT } from "../../../../../i18n/LanguageContext";
import { getMySavingsAccounts } from "../../../../../api/savingsApi";
import { getStatisticsOverview } from "../../../../../api/statisticsApi";

const formatAmount = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
};

const formatAmountShort = (value) => {
  const num = Number(value || 0);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} tỷ`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} tr`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return String(num);
};

export default function CustomerService({ home }) {
  const t = useT();
  const cards = home?.cards || {};
  const accounts = cards.accounts || {};
  const transactions = cards.transactions || {};

  const [savingsStats, setSavingsStats] = useState({ activeCount: 0, totalPrincipal: 0 });
  const [statsOverview, setStatsOverview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getMySavingsAccounts("ACTIVE");
        if (cancelled) return;
        const total = (list || []).reduce(
          (acc, s) => acc + Number(s.principal_amount || 0),
          0
        );
        setSavingsStats({ activeCount: (list || []).length, totalPrincipal: total });
      } catch {
        // im lặng — card vẫn render placeholder
      }
    })();
    (async () => {
      try {
        const data = await getStatisticsOverview();
        if (!cancelled) setStatsOverview(data);
      } catch {
        // im lặng
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.grid}>
      <Link className={styles.cardLink} to={accounts.to || "/customer/accounts"}>
        <div className={styles.card}>
          <div className={styles.arrowWrap}>
            <span className="material-symbols-outlined">arrow_outward</span>
          </div>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">
              {accounts.icon || "account_balance_wallet"}
            </span>
          </div>
          <h2 className={styles.cardTitle}>{accounts.title || t("home.accounts")}</h2>
        </div>
      </Link>

      <Link className={styles.cardLink} to={transactions.to || "/customer/transfer"}>
        <div className={styles.card}>
          <div className={styles.arrowWrap}>
            <span className="material-symbols-outlined">arrow_outward</span>
          </div>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">
              {transactions.icon || "history"}
            </span>
          </div>
          <h3 className={styles.cardTitle}>{transactions.title || t("home.transactions")}</h3>
          {transactions.desc && <p className={styles.cardDesc}>{transactions.desc}</p>}
          {transactions.new_count != null && (
            <p className={styles.successMeta}>+{transactions.new_count} {t("home.newTx")}</p>
          )}
        </div>
      </Link>

      <Link className={styles.cardLink} to="/customer/savings">
        <div className={styles.card}>
          <div className={styles.arrowWrap}>
            <span className="material-symbols-outlined">arrow_outward</span>
          </div>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">savings</span>
          </div>
          <h3 className={styles.cardTitle}>{t("home.savings")}</h3>
          <p className={styles.cardDesc}>
            {savingsStats.activeCount > 0
              ? t("home.savingsDescActive")
                  .replace("{count}", savingsStats.activeCount)
                  .replace("{total}", formatAmountShort(savingsStats.totalPrincipal))
              : t("home.savingsDescEmpty")}
          </p>
          {savingsStats.activeCount > 0 && (
            <p className={styles.successMeta}>
              {formatAmount(savingsStats.totalPrincipal)} VND
            </p>
          )}
        </div>
      </Link>

      <Link className={styles.cardLink} to="/customer/statistics">
        <div className={styles.card}>
          <div className={styles.arrowWrap}>
            <span className="material-symbols-outlined">arrow_outward</span>
          </div>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">bar_chart_4_bars</span>
          </div>
          <h3 className={styles.cardTitle}>{t("home.statistics")}</h3>
          <p className={styles.cardDesc}>{t("home.statisticsDesc")}</p>
          {statsOverview && (
            <p className={styles.mutedMeta}>
              {t("home.monthExpense")}: {formatAmountShort(statsOverview.total_expense)}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
