import styles from '../Login.module.css';

const Login_brand = () => {
  return (
    <section className={styles.brand}>
      <div className={styles.brandOverlay}></div>

      <div className={styles.brandInner}>
        <header>
          <img
            src="https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg"
            alt="Techcombank Logo"
            className={styles.logo}
          />
        </header>

        <div className={styles.brandContent}>
          <h1 className={styles.brandTitle}>Phiên giao dịch tại quầy</h1>

          <p className={styles.brandSub}>
            Dành cho khách hàng thực hiện giao dịch cùng nhân viên ngân hàng.
            Thông tin hiển thị phù hợp môi trường quầy.
          </p>

          <div className={styles.metaCards}>
            <div className={styles.metaCard}>
              <div className={styles.metaTitle}>Chuyển khoản</div>
              <div className={styles.metaDesc}>Nội bộ / liên ngân hàng</div>
            </div>

            <div className={styles.metaCard}>
              <div className={styles.metaTitle}>Thanh toán</div>
              <div className={styles.metaDesc}>Hoá đơn, QR, nạp tiền</div>
            </div>

            <div className={styles.metaCard}>
              <div className={styles.metaTitle}>Thẻ</div>
              <div className={styles.metaDesc}>Khoá/mở, hạn mức, PIN</div>
            </div>
          </div>
        </div>

        <footer className={styles.footBox}>
          <div className={styles.metaTitle}>Lưu ý</div>

          <ul className={styles.footList}>
            <li>Không chia sẻ OTP/mật khẩu cho bất kỳ ai.</li>
            <li>Phiên có thể tự kết thúc nếu không thao tác.</li>
          </ul>
        </footer>
      </div>
    </section>
  );
};

export default Login_brand;
