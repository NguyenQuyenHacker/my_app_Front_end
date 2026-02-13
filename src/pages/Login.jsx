import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import LoginForm from "../components/LoginForm.jsx";
import { login } from "../api/auth.js";
import { setSession } from "../utils/storage.js";

export default function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  async function handleSubmit(payload) {
    setServerErr("");
    setLoading(true);
    try {
      const res = await login(payload);
      setSession(res);
      nav("/", { replace: true });
    } catch (e) {
      setServerErr(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <section className="brand brand--light">
        <div className="brand-overlay" aria-hidden="true" />
        <div className="brand-inner">
          <header className="brand-head">
            <img
              src="https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg"
              alt="Techcombank Logo"
              className="tcb-logo"
            />
            <div className="pill-group">
              <span className="pill">Front Office</span>
              <span className="pill pill-soft">Customer</span>
            </div>
          </header>

          <div className="brand-copy">
            <h1>Phiên giao dịch tại quầy</h1>
            <p className="sub">
              Dành cho khách hàng thực hiện giao dịch cùng nhân viên ngân hàng. Thiết kế tập trung vào
              sự rõ ràng và bảo mật.
            </p>

            <div className="stepper">
              <div className="step">
                <div className="step-badge">1</div>
                <div>
                  <div className="step-title">Đăng nhập</div>
                  <div className="step-desc">Email / SĐT</div>
                </div>
              </div>
              <div className="step-line" />
              <div className="step">
                <div className="step-badge">2</div>
                <div>
                  <div className="step-title">Xác thực</div>
                  <div className="step-desc">OTP (nếu có)</div>
                </div>
              </div>
              <div className="step-line" />
              <div className="step">
                <div className="step-badge">3</div>
                <div>
                  <div className="step-title">Giao dịch</div>
                  <div className="step-desc">Chuyển/Thanh toán/Thẻ</div>
                </div>
              </div>
            </div>
          </div>

          <footer className="brand-foot">
            <div className="foot-box">
              <div className="foot-title">Lưu ý</div>
              <ul className="foot-list">
                <li>Không chia sẻ OTP/mật khẩu.</li>
                <li>Tự kết thúc nếu không thao tác.</li>
              </ul>
            </div>
          </footer>
        </div>
      </section>

      <section className="panel">
        <div className="card">
          <header className="card-head">
            <h2>Đăng nhập khách hàng</h2>
            <p>Dùng tài khoản của bạn để bắt đầu.</p>
          </header>

          {serverErr ? <div className="server-error">{serverErr}</div> : null}

          <LoginForm loading={loading} onSubmit={handleSubmit} />

          <div className="support">
            <div className="support-title">Tài khoản demo</div>
            <div className="support-text">
              Email: <strong>customer@bank.com</strong> • Mật khẩu: <strong>12345678</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
