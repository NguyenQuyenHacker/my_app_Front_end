import React from "react";
import { Link } from "react-router-dom";
import styles from "./CustomerService.module.css";
import { useT } from "../../../../../i18n/LanguageContext";

export default function CustomerService({ home }) {
  const t = useT();
  const cards = home?.cards || {};
  const accounts = cards.accounts || {};
  const transactions = cards.transactions || {};
  const loans = cards.loans || {};
  const creditCards = cards.cards || {};

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

      <Link className={styles.cardLink} to={loans.to || "/customer/loans"}>
        <div className={styles.card}>
          <div className={styles.arrowWrap}>
            <span className="material-symbols-outlined">arrow_outward</span>
          </div>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">
              {loans.icon || "description"}
            </span>
          </div>
          <h3 className={styles.cardTitle}>{loans.title || t("home.loans")}</h3>
          {loans.desc && <p className={styles.cardDesc}>{loans.desc}</p>}
          {loans.status && <span className={styles.badge}>{loans.status}</span>}
        </div>
      </Link>

      <Link className={styles.cardLink} to={creditCards.to || "/customer/cards"}>
        <div className={styles.card}>
          <div className={styles.arrowWrap}>
            <span className="material-symbols-outlined">arrow_outward</span>
          </div>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">
              {creditCards.icon || "credit_card"}
            </span>
          </div>
          <h3 className={styles.cardTitle}>{creditCards.title || t("home.creditCards")}</h3>
          {creditCards.desc && <p className={styles.cardDesc}>{creditCards.desc}</p>}
          {creditCards.limit && (
            <p className={styles.mutedMeta}>{t("home.limit")}: {creditCards.limit}</p>
          )}
        </div>
      </Link>
    </div>
  );
}
