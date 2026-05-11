// src/client/components/ChatbotBar/components/ApprovalCard.tsx
import { useState } from "react";
import styles from "./ApprovalCard.module.css";

// Giả lập type từ langchain/react để khớp với dữ liệu thực tế
export interface ActionRequest {
  action?: string;
  name?: string;
  args: Record<string, unknown>;
  description?: string;
}

export interface ReviewConfig {
  allowedDecisions?: ("approve" | "reject" | "edit" | "respond")[];
}

interface ApprovalCardProps {
  actionRequest: ActionRequest;
  reviewConfig?: ReviewConfig;
  onApprove: (otp?: string) => void;
  onReject: (reason: string) => void;
  onEdit: (editedArgs: Record<string, unknown>) => void;
  isProcessing: boolean;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.285Z" />
    </svg>
  );
}

export function ApprovalCard({
  actionRequest,
  reviewConfig,
  onApprove,
  onReject,
  onEdit,
  isProcessing,
}: ApprovalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedArgs, setEditedArgs] = useState<Record<string, unknown>>(actionRequest.args);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [otp, setOtp] = useState((actionRequest.args.otp as string) || "");

  const allowed = reviewConfig?.allowedDecisions ?? ["approve", "reject"];
  const canEdit = allowed.includes("edit");
  const canReject = allowed.includes("reject");
  
  const actionName = actionRequest.action || actionRequest.name;
  const isTransferMoney = actionName === "create_transfer_request";

  if (isEditing) {
    return (
      <div className={styles.card} data-testid="sdk-preview-chat-turn">
        <div className={styles.header}>
          <PencilIcon className={styles.headerIcon} />
          <span className={styles.headerTitle}>
            Chỉnh sửa — <code className={styles.actionName}>{actionName}</code>
          </span>
        </div>
        <div className={styles.body}>
          {Object.entries(editedArgs).map(([key, value]) => {
            const strValue = formatValue(value);
            const isLong = strValue.length > 80 || strValue.includes("\n");
            return (
              <div key={key} className={styles.inputGroup}>
                <label htmlFor={`edit-${key}`} className={styles.inputLabel}>{key}</label>
                {isLong ? (
                  <textarea
                    id={`edit-${key}`}
                    value={strValue}
                    onChange={(e) => setEditedArgs((prev) => ({ ...prev, [key]: e.target.value }))}
                    rows={4}
                    className={`${styles.inputField} ${styles.textareaField}`}
                  />
                ) : (
                  <input
                    id={`edit-${key}`}
                    type="text"
                    value={strValue}
                    onChange={(e) => setEditedArgs((prev) => ({ ...prev, [key]: e.target.value }))}
                    className={styles.inputField}
                  />
                )}
              </div>
            );
          })}
          
          {isTransferMoney && (
             <div className={styles.otpGroup}>
               <label htmlFor="otp-edit" className={styles.otpLabel}>Nhập mã OTP để hoàn tất:</label>
               <input
                 id="otp-edit"
                 type="password"
                 value={otp}
                 onChange={(e) => setOtp(e.target.value)}
                 placeholder="Ví dụ: 123456"
                 className={styles.otpInput}
               />
             </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => {
                const finalArgs = { ...editedArgs };
                if (otp) {
                  finalArgs.otp = otp;
                }
                onEdit(finalArgs);
                setIsEditing(false);
              }}
              disabled={isProcessing || (isTransferMoney && !otp)}
              className={`${styles.btn} ${styles.btnApprove}`}
            >
              <CheckIcon className={styles.btnIcon} />
              Lưu & Xác nhận
            </button>
            <button
              type="button"
              onClick={() => {
                setEditedArgs(actionRequest.args);
                setIsEditing(false);
              }}
              className={`${styles.btn} ${styles.btnEdit}`}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card} data-testid="sdk-preview-chat-turn">
      <div className={styles.header}>
        <ShieldIcon className={styles.headerIcon} />
        <span className={styles.headerTitle}>Yêu cầu Xác nhận Giao dịch</span>
        <span className={styles.headerBadge}>Đang chờ duyệt</span>
      </div>

      <div className={styles.body}>
        <div className={styles.infoBox}>
          <code className={styles.actionName}>{actionName}</code>
          {actionRequest.description && (
            <p className={styles.actionDesc}>{actionRequest.description}</p>
          )}

          <div className={styles.argsList}>
            {Object.entries(actionRequest.args).map(([key, value]) => {
              const strValue = formatValue(value);
              const isMultiline = strValue.includes("\n");
              return (
                <div key={key}>
                  <div className={styles.argLabel}>{key}</div>
                  {isMultiline ? (
                    <pre className={styles.argValuePre}>{strValue}</pre>
                  ) : (
                    <div className={styles.argValue}>{strValue}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {showRejectInput && (
          <div className={styles.inputGroup}>
            <label htmlFor="reject-reason" className={styles.inputLabel}>
              Lý do từ chối <span style={{ fontWeight: 'normal', opacity: 0.7 }}>(không bắt buộc)</span>
            </label>
            <input
              id="reject-reason"
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do..."
              className={styles.inputField}
            />
          </div>
        )}

        {!showRejectInput && isTransferMoney && (
          <div className={styles.otpGroup}>
            <label htmlFor="otp-review" className={styles.otpLabel}>Nhập mã OTP để xác nhận:</label>
            <input
              id="otp-review"
              type="password"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Ví dụ: 123456"
              className={styles.otpInput}
            />
          </div>
        )}

        <div className={styles.actions}>
          {showRejectInput ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onReject(rejectReason || "Người dùng từ chối");
                  setShowRejectInput(false);
                }}
                disabled={isProcessing}
                className={`${styles.btn} ${styles.btnReject}`}
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                <XIcon className={styles.btnIcon} />
                Xác nhận từ chối
              </button>
              <button
                type="button"
                onClick={() => setShowRejectInput(false)}
                className={`${styles.btn} ${styles.btnEdit}`}
              >
                Hủy
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onApprove(otp)}
                disabled={isProcessing || (isTransferMoney && !otp)}
                className={`${styles.btn} ${styles.btnApprove}`}
              >
                <CheckIcon className={styles.btnIcon} />
                Đồng ý Xác nhận
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isProcessing}
                  className={`${styles.btn} ${styles.btnEdit}`}
                >
                  <PencilIcon className={styles.btnIcon} />
                  Sửa
                </button>
              )}
              {canReject && (
                <button
                  type="button"
                  onClick={() => setShowRejectInput(true)}
                  disabled={isProcessing}
                  className={`${styles.btn} ${styles.btnReject}`}
                >
                  <XIcon className={styles.btnIcon} />
                  Từ chối
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
