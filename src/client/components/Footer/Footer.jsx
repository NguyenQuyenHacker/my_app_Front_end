import React from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandColumn}>
            <div className={styles.logo}>
              <img
                src="https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg"
                alt="Techcombank Logo"
                className={styles.logoImg}
              />
            </div>
            <p className={styles.brandDesc}>
              Ngân hàng thương mại cổ phần Kỹ Thương Việt Nam.<br />
              Vượt trội hơn mỗi ngày.
            </p>

          </div>


          <div className={styles.linksGrid}>
            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Dịch vụ</h4>
              <ul className={styles.linkList}>
                <li><a href="#accounts">Tài khoản & Thẻ</a></li>
                <li><a href="#loans">Vay vốn</a></li>
                <li><a href="#savings">Tiết kiệm</a></li>
                <li><a href="#insurance">Bảo hiểm</a></li>
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Hỗ trợ</h4>
              <ul className={styles.linkList}>
                <li><a href="#help">Trung tâm trợ giúp</a></li>
                <li><a href="#security">An toàn bảo mật</a></li>
                <li><a href="#faq">Câu hỏi thường gặp</a></li>
                <li><a href="#locations">Mạng lưới ATM & Chi nhánh</a></li>
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Liên hệ</h4>
              <ul className={styles.linkList}>
                <li><span className={styles.contactItem}>Hotline: 1800 588822</span></li>
                <li><span className={styles.contactItem}>Email: call_center@techcombank.com.vn</span></li>
                <li><a href="#feedback">Góp ý dịch vụ</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.copyright}>
            © {currentYear} Techcombank. All rights reserved.
          </div>
          <div className={styles.legalLinks}>
            <a href="#privacy">Chính sách bảo mật</a>
            <a href="#terms">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
