import React from "react";
import styles from "./AccountCard.module.css";

const AccountCard = ({ fullName, card, bankName }) => {
  const expiry = `${String(card.expiry_month).padStart(2, "0")}/${card.expiry_year}`;

  return (
    <div className={styles.cardShell}>
      <div className={styles.top}>
        <span className={styles.bank}>{bankName}</span>
        <span className={styles.type}>CREDIT</span>
      </div>

      <div className={styles.number}>{card.card_no}</div>

      <div className={styles.bottom}>
        <div>
          <span className={styles.label}>CHỦ THẺ</span>
          <strong className={styles.value}>{fullName}</strong>
        </div>

        <div>
          <span className={styles.label}>HẾT HẠN</span>
          <strong className={styles.value}>{expiry}</strong>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;