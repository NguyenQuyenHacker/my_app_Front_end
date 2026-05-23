import { useState } from "react";
import {
  confirmInternalTransfer,
  confirmExternalTransfer,
} from "../../../api/transferApi";
import styles from "./ApprovalCard.module.css";

export type PendingTransfer = {
  session_id: string;
  transfer_type: "internal" | "external";
  to_name: string;
  to_account_no: string;
  to_bank_code: string;
  amount: string;
  fee: string;
  description: string | null;
  expires_at: string;
};

type Props = {
  pending: PendingTransfer;
  onCompleted: (resultMessage: string) => void;
  onCancelled: () => void;
};

export function TransferConfirmCard({ pending, onCompleted, onCancelled }: Props) {
  const [otp, setOtp] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    const code = otp.trim();
    if (!code) {
      setError("Vui lòng nhập mã OTP.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const payload = { session_id: pending.session_id, otp: code };
      const result =
        pending.transfer_type === "internal"
          ? await confirmInternalTransfer(payload)
          : await confirmExternalTransfer(payload);

      onCompleted(
        `Đã chuyển khoản thành công. Mã giao dịch: ${result.transaction_code}. ` +
          `Số tiền: ${result.amount} VNĐ. Số dư mới: ${result.new_balance} VNĐ.`
      );
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || err?.message || "Lỗi không xác định";
      setError(`Giao dịch thất bại: ${detail}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.card} data-testid="transfer-confirm-card">
      <div className={styles.header}>
        <span className={styles.headerTitle}>Xác nhận chuyển khoản</span>
        <span className={styles.headerBadge}>Chờ OTP</span>
      </div>

      <div className={styles.body}>
        <div className={styles.infoBox}>
          <div className={styles.argsList}>
            <div>
              <div className={styles.argLabel}>Người nhận</div>
              <div className={styles.argValue}>{pending.to_name}</div>
            </div>
            <div>
              <div className={styles.argLabel}>Tài khoản</div>
              <div className={styles.argValue}>
                {pending.to_account_no} ({pending.to_bank_code})
              </div>
            </div>
            <div>
              <div className={styles.argLabel}>Số tiền</div>
              <div className={styles.argValue}>{pending.amount} VNĐ</div>
            </div>
            <div>
              <div className={styles.argLabel}>Phí</div>
              <div className={styles.argValue}>{pending.fee} VNĐ</div>
            </div>
            <div>
              <div className={styles.argLabel}>Nội dung</div>
              <div className={styles.argValue}>
                {pending.description || "(không có)"}
              </div>
            </div>
            <div>
              <div className={styles.argLabel}>Hết hạn</div>
              <div className={styles.argValue}>{pending.expires_at}</div>
            </div>
          </div>
        </div>

        <div className={styles.otpGroup}>
          <label htmlFor="otp-confirm" className={styles.otpLabel}>
            Nhập mã OTP để xác nhận:
          </label>
          <input
            id="otp-confirm"
            type="password"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Ví dụ: 123456"
            className={styles.otpInput}
            disabled={isProcessing}
            autoComplete="one-time-code"
          />
        </div>

        {error && <div className={styles.errorText}>{error}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !otp.trim()}
            className={`${styles.btn} ${styles.btnApprove}`}
          >
            {isProcessing ? "Đang xử lý..." : "Xác nhận chuyển"}
          </button>
          <button
            type="button"
            onClick={onCancelled}
            disabled={isProcessing}
            className={`${styles.btn} ${styles.btnReject}`}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
