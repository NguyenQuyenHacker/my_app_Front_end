import React from "react";
import styles from "./AccountCard.module.css";
import { useT } from "../../../../../i18n/LanguageContext";

const AccountCard = ({ fullName, card, bankName }) => {
  const t = useT();
  const expiry = `${String(card.expiry_month).padStart(2, "0")}/${card.expiry_year}`;

  return (
    <div className={styles.cardShell}>
      <div className={styles.top}>
        <div>
          <div className={styles.brand}>{bankName}</div>
          <div className={styles.cardType}>{t("account.cardCredit")}</div>
        </div>
        <div className={styles.logoMark}>
          <span />
          <span />
        </div>
      </div>

      <div className={styles.number}>{card.card_no}</div>

      <div className={styles.bottom}>
        <div>
          <span className={styles.label}>{t("account.cardHolder")}</span>
          <strong className={styles.value}>{fullName}</strong>
        </div>

        <div>
          <span className={styles.label}>{t("account.cardExpiry")}</span>
          <strong className={styles.value}>{expiry}</strong>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;
