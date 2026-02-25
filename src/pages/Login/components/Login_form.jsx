import styles from '../Login.module.css';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';

const LoginForm = ({ formData, handleChange, handleSubmit }) => {
  return (
    <section className={styles.panel}>
      <div className={styles.card}>
        <header className={styles.cardHead}>
          <h2>Đăng nhập khách hàng</h2>
          <p>Nhập thông tin để bắt đầu phiên tại quầy.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            id="phone"
            name="phone"
            label="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className={styles.row}>
            <label style={{ fontSize: '13px', display: 'flex', gap: '8px' }}>
              <input type="checkbox" style={{ accentColor: 'var(--tcb-red)' }} />
              Ghi nhớ thiết bị
            </label>

            <a href="#" className={styles.link}>Quên mật khẩu?</a>
          </div>

          <Button type="submit" variant="primary">Đăng nhập</Button>

          <div className={styles.divider}></div>

          <Button type="button" variant="secondary">Tạo tài khoản</Button>

          <p className={styles.fineprint}>
            Tiếp tục nghĩa là bạn đồng ý với{' '}
            <a href="#" className={styles.link}>Điều khoản</a>.
          </p>
        </form>
      </div>
    </section>
  );
};

export default LoginForm;
