import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Wallet, ChevronDown, Search, X } from "lucide-react";

import { getAccountOverview } from "../../../../api/accountApi";
import {
  confirmExternalTransfer,
  confirmInternalTransfer,
  initExternalTransfer,
  initInternalTransfer,
  lookupExternalRecipient,
  lookupInternalRecipient,
} from "../../../../api/transferApi";
import BankLogo from "../../../../components/BankLogo/BankLogo";
import { BANKS, findBankByCode } from "../../../../constants/banks";
import styles from "./TransferScreen.module.css";
import { clearClientToken } from "../../../../../utils/authUtils";
import { useT } from "../../../../i18n/LanguageContext";

const TRANSFER_TYPES = { INTERNAL: "INTERNAL", EXTERNAL: "EXTERNAL" };

const QUICK_AMOUNTS = [100000, 500000, 1000000, 5000000];

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
  return num.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
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
  const location = useLocation();
  const t = useT();

  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [initData, setInitData] = useState(null);
  const [confirmKey, setConfirmKey] = useState("");
  const [result, setResult] = useState(null);

  const [sourceAccount, setSourceAccount] = useState(null);

  const [recipient, setRecipient] = useState(null);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState("");

  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const bankPickerRef = useRef(null);

  // Pre-fill từ chatbot agent (route state).
  const fromAgentHandledRef = useRef(null);
  const skipAutoLookupRef = useRef(false);
  useEffect(() => {
    const fromAgent = location.state?.fromAgent;
    if (!fromAgent || !fromAgent.session_id) return;
    
    // Ngăn chặn xử lý lại cùng một session_id (ví dụ do StrictMode hoặc location update)
    if (fromAgentHandledRef.current === fromAgent.session_id) return;
    fromAgentHandledRef.current = fromAgent.session_id;

    skipAutoLookupRef.current = true;

    const isInternal = fromAgent.transfer_type === "internal";
    setForm({
      type: isInternal ? TRANSFER_TYPES.INTERNAL : TRANSFER_TYPES.EXTERNAL,
      to_account_no: fromAgent.to_account_no ?? "",
      to_bank_code: isInternal ? "" : (fromAgent.to_bank_code ?? ""),
      amount: String(fromAgent.amount ?? ""),
      description: fromAgent.description ?? "",
      otp: "",
    });
    setRecipient({
      account_no: fromAgent.to_account_no,
      bank_code: fromAgent.to_bank_code,
      full_name: fromAgent.to_name,
    });
    setInitData({
      session_id: fromAgent.session_id,
      transfer_type: fromAgent.transfer_type,
      to_account_no: fromAgent.to_account_no,
      to_bank_code: fromAgent.to_bank_code,
      to_name: fromAgent.to_name,
      amount: fromAgent.amount,
      fee: fromAgent.fee,
      description: fromAgent.description,
      expires_at: fromAgent.expires_at,
    });
    setConfirmKey(newIdempotencyKey());
    setStep(2);

    // Clear route state để reload không trigger lại
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, navigate]);

  useEffect(() => {
    if (!bankPickerOpen) return;
    const onClickOutside = (event) => {
      if (bankPickerRef.current && !bankPickerRef.current.contains(event.target)) {
        setBankPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [bankPickerOpen]);

  const filteredBanks = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    if (!q) return BANKS;
    return BANKS.filter((b) =>
      [b.code, b.short, b.name].some((s) => s.toLowerCase().includes(q))
    );
  }, [bankSearch]);

  const selectedBank = useMemo(
    () => findBankByCode(form.to_bank_code),
    [form.to_bank_code]
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await getAccountOverview();
        setSourceAccount(data?.account || null);
      } catch (error) {
        if (error.response?.status === 401) {
          clearClientToken();
          navigate("/login");
        }
      }
    })();
  }, [navigate]);

  // Auto-lookup recipient when input is filled
  useEffect(() => {
    // Bỏ qua 1 lần nếu data đến từ chatbot agent (đã có recipient từ trước)
    if (skipAutoLookupRef.current) {
      skipAutoLookupRef.current = false;
      return;
    }
    setRecipient(null);
    setRecipientError("");

    const accountNo = form.to_account_no.trim();
    if (!accountNo || accountNo.length < 4) return;
    if (form.type === TRANSFER_TYPES.EXTERNAL && !form.to_bank_code) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setRecipientLoading(true);
        const data =
          form.type === TRANSFER_TYPES.INTERNAL
            ? await lookupInternalRecipient(accountNo)
            : await lookupExternalRecipient(form.to_bank_code, accountNo);
        if (!cancelled) setRecipient(data);
      } catch (error) {
        if (cancelled) return;
        if (error.response?.status === 401) {
          clearClientToken();
          navigate("/login");
          return;
        }
        setRecipientError(error.response?.data?.detail || t("transfer.recipientNotFound") || "Không tìm thấy tài khoản");
      } finally {
        if (!cancelled) setRecipientLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.to_account_no, form.to_bank_code, form.type, navigate, t]);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const setType = (type) => {
    setForm({ ...initialForm, type });
    setStep(1);
    setErrorMessage("");
    setInitData(null);
    setResult(null);
    setRecipient(null);
    setRecipientError("");
  };

  const validateInit = () => {
    if (form.type === TRANSFER_TYPES.EXTERNAL && !form.to_bank_code) {
      return t("transfer.errMissingBankCode");
    }
    if (!form.to_account_no.trim()) return t("transfer.errMissingAccount");
    if (!recipient) return t("transfer.recipientNotFound") || "Tài khoản người nhận không hợp lệ";
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
    setRecipient(null);
    setRecipientError("");
    setErrorMessage("");
  };

  const balance = useMemo(
    () => (sourceAccount ? Number(sourceAccount.balance || 0) : 0),
    [sourceAccount]
  );

  const renderTabs = () => (
    <div className={styles.tabs} role="tablist">
      <button
        type="button"
        role="tab"
        className={`${styles.tab} ${form.type === TRANSFER_TYPES.INTERNAL ? styles.tabActive : ""}`}
        onClick={() => setType(TRANSFER_TYPES.INTERNAL)}
      >
        {t("transfer.tabInternal")}
      </button>
      <button
        type="button"
        role="tab"
        className={`${styles.tab} ${form.type === TRANSFER_TYPES.EXTERNAL ? styles.tabActive : ""}`}
        onClick={() => setType(TRANSFER_TYPES.EXTERNAL)}
      >
        {t("transfer.tabExternal")}
      </button>
    </div>
  );

  const renderRecipientHint = () => {
    if (recipientLoading) {
      return <div className={styles.recipientHint}>{t("transfer.lookingUp") || "Đang tra cứu..."}</div>;
    }
    if (recipientError) {
      return <div className={`${styles.recipientHint} ${styles.recipientError}`}>{recipientError}</div>;
    }
    if (recipient) {
      return (
        <div className={`${styles.recipientHint} ${styles.recipientFound}`}>
          <span className={styles.recipientLabel}>{t("transfer.receiverNameLabel")}</span>
          <strong className={styles.recipientName}>{recipient.full_name}</strong>
        </div>
      );
    }
    return null;
  };

  const renderStep1 = () => (
    <form onSubmit={handleInit} className={styles.form}>
      <section className={styles.card}>
        {renderTabs()}

        {form.type === TRANSFER_TYPES.EXTERNAL && (
          <div className={styles.field}>
            <label className={styles.label}>{t("transfer.bankCodeLabel")}</label>
            <div className={styles.bankPicker} ref={bankPickerRef}>
              <button
                type="button"
                className={styles.bankTrigger}
                onClick={() => setBankPickerOpen((prev) => !prev)}
              >
                {selectedBank ? (
                  <div className={styles.bankTriggerContent}>
                    <BankLogo bank={selectedBank} size={36} />
                    <div className={styles.bankTriggerText}>
                      <span className={styles.bankTriggerShort}>{selectedBank.short}</span>
                      <span className={styles.bankTriggerName}>{selectedBank.name}</span>
                    </div>
                  </div>
                ) : (
                  <span className={styles.bankTriggerPlaceholder}>
                    {t("transfer.bankCodePlaceholder")}
                  </span>
                )}
                <ChevronDown
                  size={20}
                  strokeWidth={2}
                  className={`${styles.bankTriggerChevron} ${bankPickerOpen ? styles.bankTriggerChevronOpen : ""}`}
                />
              </button>

              {bankPickerOpen && (
                <div className={styles.bankPanel}>
                  <div className={styles.bankSearchRow}>
                    <input
                      type="text"
                      className={styles.bankSearchInput}
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      placeholder={t("transfer.bankCodePlaceholder")}
                      autoFocus
                    />
                    {bankSearch ? (
                      <button
                        type="button"
                        className={styles.bankSearchClear}
                        onClick={() => setBankSearch("")}
                        aria-label="Clear"
                      >
                        <X size={18} strokeWidth={2} />
                      </button>
                    ) : (
                      <Search size={20} strokeWidth={2} className={styles.bankSearchIcon} />
                    )}
                  </div>

                  <div className={styles.bankList}>
                    {filteredBanks.length === 0 && (
                      <div className={styles.bankEmpty}>Không tìm thấy ngân hàng</div>
                    )}
                    {filteredBanks.map((b) => (
                      <button
                        key={b.code}
                        type="button"
                        className={`${styles.bankItem} ${selectedBank?.code === b.code ? styles.bankItemActive : ""}`}
                        onClick={() => {
                          setForm((prev) => ({ ...prev, to_bank_code: b.code }));
                          setBankPickerOpen(false);
                          setBankSearch("");
                        }}
                      >
                        <BankLogo bank={b} size={44} />
                        <div className={styles.bankItemBody}>
                          <span className={styles.bankItemShort}>{b.short}</span>
                          <span className={styles.bankItemName}>{b.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>{t("transfer.accountNoLabel")}</label>
          <input
            className={styles.input}
            type="text"
            inputMode="numeric"
            value={form.to_account_no}
            onChange={setField("to_account_no")}
            placeholder={t("transfer.accountNoPlaceholder")}
          />
          {renderRecipientHint()}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.fromLabel}>{t("transfer.fromLabel") || "Từ"}</div>
        <div className={styles.sourceRow}>
          <div className={styles.sourceIcon}>
            <Wallet size={22} strokeWidth={1.8} />
          </div>
          <div className={styles.sourceBody}>
            <div className={styles.sourceTitle}>{t("transfer.paymentAccount") || "Tài khoản thanh toán"}</div>
            <div className={styles.sourceAccountNo}>{sourceAccount?.account_no || "—"}</div>
          </div>
          <div className={styles.sourceBalance}>
            <span className={styles.balanceCurrency}>VND</span>
            <span className={styles.balanceValue}>{formatAmount(balance)}</span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t("transfer.amountLabel")}</label>
          <div className={styles.amountRow}>
            <div className={styles.currencyChip}>VND</div>
            <input
              className={`${styles.input} ${styles.amountInput}`}
              type="number"
              min="0"
              inputMode="numeric"
              value={form.amount}
              onChange={setField("amount")}
              placeholder="0"
            />
          </div>
          <div className={styles.quickAmounts}>
            {QUICK_AMOUNTS.map((v) => (
              <button
                key={v}
                type="button"
                className={styles.quickAmount}
                onClick={() => setForm((prev) => ({ ...prev, amount: String(v) }))}
              >
                {formatAmount(v)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t("transfer.descLabel")}</label>
          <textarea
            className={styles.textarea}
            value={form.description}
            onChange={setField("description")}
            placeholder={t("transfer.descPlaceholder")}
            rows={2}
          />
        </div>
      </section>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      <div className={styles.actionRow}>
        <Link to="/customer/accounts?view=overview" className={styles.secondaryButton}>
          {t("transfer.cancelBtn")}
        </Link>
        <button type="submit" className={styles.primaryButton} disabled={loading || !recipient}>
          {loading ? t("common.processing") : t("transfer.nextBtn")}
        </button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleConfirm} className={styles.form}>
      <section className={styles.card}>
        <div className={styles.confirmTitle}>{t("transfer.receiverInfoTitle")}</div>
        <div className={styles.summary}>
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
            <span className={styles.summaryAmount}>{formatAmount(initData?.amount)} VND</span>
          </div>
          {initData?.description && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{t("transfer.descLabel")}</span>
              <span className={styles.summaryValue}>{initData.description}</span>
            </div>
          )}
          <div className={styles.expiryHint}>
            {t("transfer.sessionExpires")}: {formatDateTime(initData?.expires_at)}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label}>{t("transfer.otpLabel")}</label>
          <input
            className={styles.input}
            type="password"
            value={form.otp}
            onChange={setField("otp")}
            placeholder={t("transfer.otpPlaceholder")}
            autoFocus
            maxLength={12}
          />
        </div>
      </section>

      {errorMessage && <div className={styles.error}>{errorMessage}</div>}

      <div className={styles.actionRow}>
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
        <button type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? t("common.processing") : t("transfer.confirmBtn")}
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
        <div className={`${styles.statusCard} ${styles.statusSuccess}`}>
          <p className={styles.statusTitle}>{t("transfer.successTitle")}</p>
          <p>{t("transfer.successCode")}: {result.transaction_code}</p>
          <p>{t("transfer.successStatus")}: {status}</p>
          <p>{t("transfer.successBalance")}: {formatAmount(result.new_balance)} VND</p>
          {result.external_ref_id && <p>{t("transfer.successRef")}: {result.external_ref_id}</p>}
        </div>
      );
    } else if (status === "PROCESSING" || status === "PENDING") {
      banner = (
        <div className={`${styles.statusCard} ${styles.statusProcessing}`}>
          <p className={styles.statusTitle}>{t("transfer.processingTitle")}</p>
          <p>{t("transfer.processingMessage")}</p>
          <p>{t("transfer.successCode")}: {result.transaction_code}</p>
          {result.external_ref_id && <p>{t("transfer.successRef")}: {result.external_ref_id}</p>}
        </div>
      );
    } else {
      banner = (
        <div className={`${styles.statusCard} ${styles.statusFailed}`}>
          <p className={styles.statusTitle}>{t("transfer.failedTitle")}</p>
          <p>{t("transfer.successCode")}: {result.transaction_code}</p>
          {result.failure_reason && <p>{t("transfer.failureReason")}: {result.failure_reason}</p>}
          <p>{t("transfer.successBalance")}: {formatAmount(result.new_balance)} VND</p>
        </div>
      );
    }

    return (
      <div className={styles.form}>
        {banner}
        <div className={styles.actionRow}>
          <Link to="/customer/accounts?view=overview" className={styles.secondaryButton}>
            {t("transfer.backBtn")}
          </Link>
          <button type="button" className={styles.primaryButton} onClick={resetAll}>
            {t("transfer.nextBtn")}
          </button>
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
        <Link to="/customer/accounts?view=overview" className={styles.backLink}>
          {t("transfer.backBtn")}
        </Link>
      </div>

      <div className={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default TransferScreen;
