import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createTransfer } from "../../../../api/transferApi";
import styles from "./TransferScreen.module.css";

const initialForm = {
  receiver_bank_name: "TCB",
  receiver_name: "",
  receiver_account_no: "",
  amount: "",
  description: "",
  otp: "",
};

const TransferScreen = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState(null);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const validateForm = () => {
    if (!form.receiver_bank_name.trim()) return "Vui lòng nhập ngân hàng nhận.";
    if (!form.receiver_name.trim()) return "Vui lòng nhập tên người nhận.";
    if (!form.receiver_account_no.trim()) return "Vui lòng nhập số tài khoản nhận.";
    if (!form.amount || Number(form.amount) <= 0) return "Số tiền không hợp lệ.";
    if (!form.otp.trim()) return "Vui lòng nhập OTP.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessData(null);

      const payload = {
        receiver_bank_name: form.receiver_bank_name.trim(),
        receiver_name: form.receiver_name.trim(),
        receiver_account_no: form.receiver_account_no.trim(),
        amount: Number(form.amount),
        description: form.description.trim() || null,
        otp: form.otp.trim(),
      };

      const result = await createTransfer(payload);
      setSuccessData(result);

      setForm(initialForm);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorMessage(
        error.response?.data?.detail || "Không thể thực hiện chuyển tiền."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Chuyển tiền</h1>
          <p className={styles.pageSubtitle}>
            Tạo giao dịch chuyển tiền từ tài khoản của bạn
          </p>
        </div>

        <Link to="/customer/accounts?view=overview" className={styles.backButton}>
          Quay lại tài khoản
        </Link>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Ngân hàng nhận</label>
              <input
                className={styles.input}
                type="text"
                value={form.receiver_bank_name}
                onChange={handleChange("receiver_bank_name")}
                placeholder="VD: TCB, VCB, MB..."
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tên người nhận</label>
              <input
                className={styles.input}
                type="text"
                value={form.receiver_name}
                onChange={handleChange("receiver_name")}
                placeholder="Nhập tên người nhận"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Số tài khoản nhận</label>
              <input
                className={styles.input}
                type="text"
                value={form.receiver_account_no}
                onChange={handleChange("receiver_account_no")}
                placeholder="Nhập số tài khoản"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Số tiền</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                value={form.amount}
                onChange={handleChange("amount")}
                placeholder="Nhập số tiền"
              />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label}>Nội dung</label>
              <input
                className={styles.input}
                type="text"
                value={form.description}
                onChange={handleChange("description")}
                placeholder="Nhập nội dung chuyển khoản"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>OTP</label>
              <input
                className={styles.input}
                type="password"
                value={form.otp}
                onChange={handleChange("otp")}
                placeholder="Nhập OTP"
              />
            </div>
          </div>

          {errorMessage && <div className={styles.error}>{errorMessage}</div>}

          {successData && (
            <div className={styles.success}>
              <p className={styles.successTitle}>Chuyển tiền thành công</p>
              <p>Mã giao dịch: {successData.transfer_id}</p>
              <p>Số dư mới: {successData.new_balance}</p>
            </div>
          )}

          <div className={styles.actionRow}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác nhận chuyển tiền"}
            </button>

            <Link to="/customer/accounts?view=overview" className={styles.secondaryButton}>
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferScreen;