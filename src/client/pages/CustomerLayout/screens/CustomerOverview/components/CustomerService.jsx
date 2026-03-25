import React from "react";
import { Link } from "react-router-dom";
import styles from "./CustomerService.module.css";

export default function CustomerService() {
  return (
    <div className={styles.grid}>
      <Link className={styles.cardLink} to="/customer/accounts">
        <div className={styles.card}>
          <div className={styles.arrowWrap}>
            <span className="material-symbols-outlined">arrow_outward</span>
          </div>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <h2 className={styles.cardTitle}>Tài khoản</h2>
        </div> 
      </Link>

      <Link className={styles.cardLink} to="/customer/transactions">
        <div className={styles.card}>
          <div className={styles.arrowWrap}> 
            <span className="material-symbols-outlined">arrow_outward</span>
          </div>

          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">history</span>
          </div>

          <h3 className={styles.cardTitle}>Giao dịch</h3>
          <p className={styles.cardDesc}>Lịch sử 30 ngày</p>
          <p className={styles.successMeta}>+12 Giao dịch mới</p>
        </div>
      </Link>

      <Link className={styles.cardLink} to="/customer/loans">
        <div className={styles.card}>
          <div className={styles.arrowWrap}>
            <span className="material-symbols-outlined">arrow_outward</span>
          </div>

          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">description</span>
          </div>

          <h3 className={styles.cardTitle}>Hồ sơ vay</h3> 
          <p className={styles.cardDesc}>1 Khoản vay mua nhà</p>
          <span className={styles.badge}>Đang thẩm định</span>
        </div>
      </Link>

      <Link className={styles.cardLink} to="/customer/cards">
        <div className={styles.card}>
          <div className={styles.arrowWrap}>
            <span className="material-symbols-outlined">arrow_outward</span>
          </div>

          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">credit_card</span>
          </div>

          <h3 className={styles.cardTitle}>Thẻ tín dụng</h3>
          <p className={styles.cardDesc}>Visa Signature</p>
          <p className={styles.mutedMeta}>Hạn mức: 45tr</p>
        </div>
      </Link>
    </div>
  );
}