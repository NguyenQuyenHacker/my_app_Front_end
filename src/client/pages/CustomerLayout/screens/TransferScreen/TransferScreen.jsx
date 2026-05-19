import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  initInternalTransfer,
  confirmInternalTransfer,
  initExternalTransfer,
  confirmExternalTransfer,
} from "../../../../api/transferApi";
import styles from "./TransferScreen.module.css";
import { clearClientToken } from "../../../../../utils/authUtils";
import { useT } from "../../../../i18n/LanguageContext";

const TRANSFER_TYPES = { INTERNAL: "INTERNAL", EXTERNAL: "EXTERNAL" };

const initialForm = {
  type: TRANSFER_TYPES.INTERNAL,
  to_account_no: "",
  to_bank_code: "",
  amount: "",
  description: "",
  otp: "",
};

const newIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
};

const formatDateTime = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
};

const TransferScreen = () => {
  const navigate = useNavigate();
  const t = useT();

  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [initData, setInitData] = useState(null);
  const [confirmKey, setConfirmKey] = useState("");
  const [result, setResult] = useState(null);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const setType = (type) => {
    setForm({ ...initialForm, type });
    setStep(1);
    setErrorMessage("");
    setInitData(null);
    setResult(null);
  };

  const validateInit = () => {
    if (form.type === TRANSFER_TYPES.EXTERNAL && !form.to_bank_code.trim()) {
      return t("transfer.errMissingBankCode");
    }
    if (!form.to_account_no.trim()) return t("transfer.errMissingAccount");
    if (!form.amount || Number(form.amount) <= 0) return t("transfer.errInvalidAmount");
    return "";
  };

  const handleAuthError = (error) => {
    if (error?.response?.status === 401 && !initData) {
      clearClientToken();
      navigate("/login");
      return true;
    }
    return false;
  };

  const handleInit = async (event) => {
    event.preventDefault();
    const validationError = validateInit();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const idemKey = newIdempotencyKey();
      let response;

      if (form.type === TRANSFER_TYPES.INTERNAL) {
        response = await initInternalTransfer(
          {
            to_account_no: form.to_account_no.trim(),
            amount: Number(form.amount),
            description: form.description.trim() || null,
          },
          idemKey
        );
      } else {
        response = await initExternalTransfer(
          {
            to_bank_code: form.to_bank_code.trim().toUpperCase(),
            to_account_number: form.to_account_no.trim(),
            amount: Number(form.amount),
            description: form.description.trim() || null,
          },
          idemKey
        );
      }

      setInitData(response);
      setConfirmKey(newIdempotencyKey());
      setStep(2);
    } catch (error) {
      if (handleAuthError(error)) return;
      setErrorMessage(error.response?.data?.detail || t("transfer.errCannotTransfer"));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    if (!form.otp.trim()) {
      setErrorMessage(t("transfer.errMissingOtp"));
      return;
    }
    if (!initData) {
      setErrorMessage(t("transfer.errSessionExpired"));
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const payload = { session_id: initData.session_id, otp: form.otp.trim() };
      const response =
        form.type === TRANSFER_TYPES.INTERNAL
          ? await confirmInternalTransfer(payload, confirmKey)
          : await confirmExternalTransfer(payload, confirmKey);

      setResult(response);
      setStep(3);
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage(error.response.data?.detail || "OTP không hợp lệ.");
        return;
      }
      if (handleAuthError(error)) return;
      setErrorMessage(error.response?.data?.detail || t("transfer.errCannotTransfer"));
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setForm(initialForm);
    setStep(1);
    setInitData(null);
    setResult(null);
    setErrorMessage("");
  };

  const renderTabs = () => (
    <div className={styles.tabs}>
      <button
        type="button"
        className={`${styles.tab} ${form.type === TRANSFER_TYPES.INTERNAL ? styles.tabActive : ""}`}
        onClick={() => setType(TRANSFER_TYPES.INTERNAL)}
      >
        {t("transfer.tabInternal")}
      </button>
      <button
        type="button"
        className={`${styles.tab} ${form.type === TRANSFER_TYPES.EXTERNAL ? styles.tabActive : ""}`}
        onClick={() => setType(TRANSFER_TYPES.EXTERNAL)}
      >
        {t("transfer.tabExternal")}
      </button>
    </div>
  );

  const renderStep1 = () => (
    <form onSubmit={handleInit} className={styles.form}>
      {renderTabs()}
      <div className={styles.grid}>
        {form.type === TRANSFER_TYPES.EXTERNAL && (
          <div className={styles.field}>
            <label className={styles.label}>{t("transfer.bankCodeLabel")}</label>
            <input
              className={styles.input}
              type="text"
              value={form.to_bank_code}
              onChange={setField("to_bank_code")}
              placeholder={t("transfer.bankCodePlaceholder")}
            />
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>{t("transfer.accountNoLabel")}</label>
          <input
            className={styles.input}
            type="text"
            value={form.to_account_no}
            onChange={setField("to_account_no")}
            placeholder={t("transfer.accountNoPlaceholder")}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t("transfer.amountLabel")}</label>
          <input
            className={styles.input}
            type="number"
            min="1"
            value={form.amount}
            onChange={setField("amount")}
            placeholder={t("transfer.amountPlaceholder")}
          />
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label}>{t("transfer.descLabel")}</label>
          <input
            className={styles.input}
            type="text"
            value={form.description}
            onChange={setField("description")}
            placeholder={t("transfer.descPlaceholder")}
          />
        </div>
      </div>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      <div className={styles.actionRow}>
        <button type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? t("common.processing") : t("transfer.nextBtn")}
        </button>
        <Link to="/customer/accounts?view=overview" className={styles.secondaryButton}>
          {t("transfer.cancelBtn")}
        </Link>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleConfirm} className={styles.form}>
      <div className={styles.summary}>
        <p className={styles.summaryTitle}>{t("transfer.receiverInfoTitle")}</p>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t("transfer.receiverNameLabel")}</span>
          <span className={styles.summaryValue}>{initData?.to_name}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t("transfer.accountNoLabel")}</span>
          <span className={styles.summaryValue}>{initData?.to_account_no}</span>
        </div>
        {initData?.to_bank_code && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t("transfer.receiverBankLabel")}</span>
            <span className={styles.summaryValue}>{initData.to_bank_code}</span>
          </div>
        )}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t("transfer.amountLabel")}</span>
          <span className={styles.summaryAmount}>{formatAmount(initData?.amount)} đ</span>
        </div>
        {initData?.description && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t("transfer.descLabel")}</span>
            <span className={styles.summaryValue}>{initData.description}</span>
          </div>
        )}
        <p className={styles.expiryHint}>
          {t("transfer.sessionExpires")}: {formatDateTime(initData?.expires_at)}
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>{t("transfer.otpLabel")}</label>
          <input
            className={styles.input}
            type="password"
            value={form.otp}
            onChange={setField("otp")}
            placeholder={t("transfer.otpPlaceholder")}
            autoFocus
          />
        </div>
      </div>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      <div className={styles.actionRow}>
        <button type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? t("common.processing") : t("transfer.confirmBtn")}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => {
            setStep(1);
            setInitData(null);
            setForm((prev) => ({ ...prev, otp: "" }));
            setErrorMessage("");
          }}
          disabled={loading}
        >
          {t("transfer.backBtn2")}
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => {
    if (!result) return null;
    const status = result.status;
    let banner;

    if (status === "SUCCESS") {
      banner = (
        <div className={styles.success}>
          <p className={styles.successTitle}>{t("transfer.successTitle")}</p>
          <p>{t("transfer.successCode")}: {result.transaction_code}</p>
          <p>{t("transfer.successStatus")}: {status}</p>
          <p>{t("transfer.successBalance")}: {formatAmount(result.new_balance)} đ</p>
          {result.external_ref_id && (
            <p>{t("transfer.successRef")}: {result.external_ref_id}</p>
          )}
        </div>
      );
    } else if (status === "PROCESSING" || status === "PENDING") {
      banner = (
        <div className={styles.processing}>
          <p className={styles.successTitle}>{t("transfer.processingTitle")}</p>
          <p>{t("transfer.processingMessage")}</p>
          <p>{t("transfer.successCode")}: {result.transaction_code}</p>
          {result.external_ref_id && (
            <p>{t("transfer.successRef")}: {result.external_ref_id}</p>
          )}
        </div>
      );
    } else {
      banner = (
        <div className={styles.failed}>
          <p className={styles.successTitle}>{t("transfer.failedTitle")}</p>
          <p>{t("transfer.successCode")}: {result.transaction_code}</p>
          {result.failure_reason && (
            <p>{t("transfer.failureReason")}: {result.failure_reason}</p>
          )}
          <p>{t("transfer.successBalance")}: {formatAmount(result.new_balance)} đ</p>
        </div>
      );
    }

    return (
      <div className={styles.form}>
        {banner}
        <div className={styles.actionRow}>
          <button type="button" className={styles.primaryButton} onClick={resetAll}>
            {t("transfer.nextBtn")}
          </button>
          <Link to="/customer/accounts?view=overview" className={styles.secondaryButton}>
            {t("transfer.backBtn")}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t("transfer.pageTitle")}</h1>
          <p className={styles.pageSubtitle}>{t("transfer.pageSubtitle")}</p>
        </div>

        <Link to="/customer/accounts?view=overview" className={styles.backButton}>
          {t("transfer.backBtn")}
        </Link>
      </div>

      <div className={styles.card}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default TransferScreen;
