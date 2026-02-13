import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/app.css";
import Button from "../components/Button.jsx";
import { clearSession, getUser } from "../utils/storage.js";
import { logout } from "../api/auth.js";

export default function Dashboard() {
  const nav = useNavigate();
  const user = getUser();

  async function handleLogout() {
    await logout();
    clearSession();
    nav("/login", { replace: true });
  }

  return (
    <main className="app">
      <header className="app-top">
        <div>
          <div className="app-title">Front Office • Customer Session</div>
          <div className="app-sub">
            Xin chào, <strong>{user?.name || "Khách hàng"}</strong>
          </div>
        </div>
        <Button variant="secondary" onClick={handleLogout}>Đăng xuất</Button>
      </header>

      <section className="grid">
        <div className="tile">
          <div className="tile-title">Số dư</div>
          <div className="tile-value">25,400,000 VND</div>
          <div className="tile-sub">Tài khoản thanh toán</div>
        </div>

        <div className="tile">
          <div className="tile-title">Giao dịch nhanh</div>
          <div className="tile-sub">Chuyển khoản • QR • Hoá đơn</div>
          <Button onClick={() => alert("Demo: mở luồng giao dịch")}>Bắt đầu</Button>
        </div>

        <div className="tile">
          <div className="tile-title">Thẻ</div>
          <div className="tile-sub">Khoá/mở • Hạn mức • PIN</div>
          <Button onClick={() => alert("Demo: mở quản lý thẻ")}>Quản lý</Button>
        </div>
      </section>
    </main>
  );
}
