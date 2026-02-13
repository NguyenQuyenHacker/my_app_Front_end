import React, { useMemo, useState } from "react";
import InputField from "./InputField.jsx";
import Button from "./Button.jsx";
import { isEmailOrPhone, minLen } from "../utils/validators.js";

export default function LoginForm({ onSubmit, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    if (!touched) return {};
    const e = {};
    if (!isEmailOrPhone(username)) e.username = "Nhập email hoặc số điện thoại hợp lệ";
    if (!minLen(password, 6)) e.password = "Mật khẩu tối thiểu 6 ký tự";
    return e;
  }, [username, password, touched]);

  const canSubmit = Object.keys(errors).length === 0 && username && password;

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!canSubmit) return;
        onSubmit({ username: username.trim(), password });
      }}
    >
      <InputField
        id="username"
        label="Số điện thoại / Email"
        value={username}
        onChange={setUsername}
        autoComplete="username"
        error={errors.username}
      />

      <InputField
        id="password"
        label="Mật khẩu"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        error={errors.password}
      />

      <div className="row">
        <label className="check">
          <input type="checkbox" />
          <span>Ghi nhớ thiết bị</span>
        </label>
        <a className="link" href="#" onClick={(e) => e.preventDefault()}>
          Quên mật khẩu?
        </a>
      </div>

      <Button type="submit" disabled={loading || !canSubmit}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <div className="divider" />

      <Button type="button" variant="secondary" onClick={() => alert("Demo: mở trang tạo tài khoản")}>
        Tạo tài khoản
      </Button>

      <p className="fineprint">
        Demo UI. Khi làm thật, bạn nối API và bật OTP/2FA.
      </p>
    </form>
  );
}
