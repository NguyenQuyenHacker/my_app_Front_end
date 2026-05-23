import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiggyBank, ChevronLeft } from "lucide-react";

import {
  confirmEarlyWithdraw,
  confirmSavings,
  getMySavingsAccounts,
  getSavingsDetail,
  getSavingsProducts,
  initEarlyWithdraw,
  initSavings,
  previewSavings,
} from "../../../../api/savingsApi";
import { getAccountOverview } from "../../../../api/accountApi";
import { clearClientToken } from "../../../../../utils/authUtils";
import { useT } from "../../../../i18n/LanguageContext";
import styles from "./SavingsScreen.module.css";

const QUICK_AMOUNTS = [1000000, 5000000, 10000000, 50000000];
const STATUS_FILTERS = ["ALL", "ACTIVE", "MATURED", "WITHDRAWN_EARLY"];

const newIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") return "0";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
};

const formatPercent = (rate) => {
  const num = Number(rate);
  if (Number.isNaN(num)) return "";
  return `${(num * 100).toFixed(2)}%`;
};

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return iso;
  }
};

const formatDateTime = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
};

const SavingsScreen = () => {
  const navigate = useNavigate();
  const t = useT();

  const [tab, setTab] = useState("deposit");
  const [view, setView] = useState("list");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [mySavings, setMySavings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceAccount, setSourceAccount] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [amount, setAmount] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [otp, setOtp] = useState("");
  const [initData, setInitData] = useState(null);
  const [resultData, setResultData] = useState(null);

  const [detail, setDetail] = useState(null);
  const [withdrawInit, setWithdrawInit] = useState(null);
  const [withdrawResult, setWithdrawResult] = useState(null);

  const balance = useMemo(
    () => (sourceAccount ? Number(sourceAccount.balance || 0) : 0),
    [sourceAccount]
  );

  const handleAuthError = (error) => {
    if (error?.response?.status === 401) {
      clearClientToken();
      navigate("/login");
      return true;
    }
    return false;
  };

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getSavingsProducts();
      setProducts(data || []);
    } catch (error) {
      if (handleAuthError(error)) return;
      setErrorMessage(t("savings.errLoadProducts"));
    }
  }, [t]);

  const fetchSourceAccount = useCallback(async () => {
    try {
      const data = await getAccountOverview();
      setSourceAccount(data?.account || null);
    } catch (error) {
      handleAuthError(error);
    }
  }, []);

  const fetchMySavings = useCallback(async (status) => {
    try {
      const data = await getMySavingsAccounts(status === "ALL" ? null : status);
      setMySavings(data || []);
    } catch (error) {
      if (handleAuthError(error)) return;
      setErrorMessage(t("savings.errLoadList"));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    fetchProducts();
    fetchSourceAccount();
  }, [fetchProducts, fetchSourceAccount]);

  useEffect(() => {
    if (tab === "my") {
      fetchMySavings(statusFilter);
    }
  }, [tab, statusFilter, fetchMySavings]);

  // Live preview khi user gõ số tiền
  useEffect(() => {
    if (view !== "deposit-form" || !selectedProduct) return;
    const num = Number(amount);
    if (!num || num < Number(selectedProduct.min_amount)) {
      setPreviewData(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const data = await previewSavings({
          product_id: selectedProduct.product_id,
          amount: num,
        });
        if (!cancelled) setPreviewData(data);
      } catch {
        if (!cancelled) setPreviewData(null);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amount, selectedProduct, view]);

  const resetDepositFlow = () => {
    setSelectedProduct(null);
    setAmount("");
    setPreviewData(null);
    setOtp("");
    setInitData(null);
    setResultData(null);
    setErrorMessage("");
    setView("list");
  };

  const resetWithdrawFlow = () => {
    setDetail(null);
    setWithdrawInit(null);
    setWithdrawResult(null);
    setOtp("");
    setErrorMessage("");
    setView("list");
  };

  const handlePickProduct = (product) => {
    setSelectedProduct(product);
    setAmount("");
    setPreviewData(null);
    setErrorMessage("");
    setView("deposit-form");
  };

  const handleSubmitDeposit = async (event) => {
    event.preventDefault();
    if (!selectedProduct) return;
    const num = Number(amount);
    if (!num || num <= 0) {
      setErrorMessage(t("savings.errInvalidAmount"));
      return;
    }
    if (num < Number(selectedProduct.min_amount)) {
      setErrorMessage(
        t("savings.errMinAmount").replace("{min}", formatAmount(selectedProduct.min_amount))
      );
      return;
    }
    if (num > balance) {
      setErrorMessage(t("savings.errInsufficient"));
      return;
    }
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await initSavings(
        { product_id: selectedProduct.product_id, amount: num },
        newIdempotencyKey()
      );
      setInitData(data);
      setOtp("");
      setView("deposit-otp");
    } catch (error) {
      if (handleAuthError(error)) return;
      setErrorMessage(error.response?.data?.detail || t("savings.errInit"));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeposit = async (event) => {
    event.preventDefault();
    if (!otp.trim()) {
      setErrorMessage(t("savings.errMissingOtp"));
      return;
    }
    if (!initData) return;
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await confirmSavings(
        { session_id: initData.session_id, otp: otp.trim() },
        newIdempotencyKey()
      );
      setResultData(data);
      setView("deposit-success");
      fetchSourceAccount();
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage(error.response.data?.detail || t("savings.errInvalidOtp"));
        return;
      }
      setErrorMessage(error.response?.data?.detail || t("savings.errConfirm"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (savingsId) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getSavingsDetail(savingsId);
      setDetail(data);
      setView("detail");
    } catch (error) {
      if (handleAuthError(error)) return;
      setErrorMessage(error.response?.data?.detail || t("savings.errLoadDetail"));
    } finally {
      setLoading(false);
    }
  };

  const handleInitWithdraw = async () => {
    if (!detail) return;
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await initEarlyWithdraw(detail.savings_id, newIdempotencyKey());
      setWithdrawInit(data);
      setOtp("");
      setView("withdraw-otp");
    } catch (error) {
      if (handleAuthError(error)) return;
      setErrorMessage(error.response?.data?.detail || t("savings.errInit"));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmWithdraw = async (event) => {
    event.preventDefault();
    if (!otp.trim() || !withdrawInit) {
      setErrorMessage(t("savings.errMissingOtp"));
      return;
    }
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await confirmEarlyWithdraw(
        detail.savings_id,
        { session_id: withdrawInit.session_id, otp: otp.trim() },
        newIdempotencyKey()
      );
      setWithdrawResult(data);
      setView("withdraw-success");
      fetchSourceAccount();
      fetchMySavings(statusFilter);
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage(error.response.data?.detail || t("savings.errInvalidOtp"));
        return;
      }
      setErrorMessage(error.response?.data?.detail || t("savings.errConfirm"));
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    if (status === "ACTIVE") return <span className={`${styles.statusBadge} ${styles.statusActive}`}>{t("savings.statusActive")}</span>;
    if (status === "MATURED") return <span className={`${styles.statusBadge} ${styles.statusMatured}`}>{t("savings.statusMatured")}</span>;
    return <span className={`${styles.statusBadge} ${styles.statusWithdrawn}`}>{t("savings.statusWithdrawn")}</span>;
  };

  const renderTabs = () => (
    <div className={styles.tabs}>
      <button
        type="button"
        className={`${styles.tab} ${tab === "deposit" ? styles.tabActive : ""}`}
        onClick={() => {
          setTab("deposit");
          setErrorMessage("");
        }}
      >
        {t("savings.tabDeposit")}
      </button>
      <button
        type="button"
        className={`${styles.tab} ${tab === "my" ? styles.tabActive : ""}`}
        onClick={() => {
          setTab("my");
          setErrorMessage("");
        }}
      >
        {t("savings.tabMyAccounts")}
      </button>
    </div>
  );

  const renderProductList = () => (
    <div className={styles.card}>
      {renderTabs()}
      <div className={styles.productGrid}>
        {products.length === 0 && (
          <div className={styles.state}>{t("savings.noProducts")}</div>
        )}
        {products.map((p) => (
          <div key={p.product_id} className={styles.productCard} onClick={() => handlePickProduct(p)}>
            <div className={styles.productHead}>
              <div>
                <div className={styles.productName}>{p.name}</div>
                <div className={styles.productCode}>{p.code}</div>
              </div>
              <div className={styles.rateBadge}>
                {formatPercent(p.interest_rate)}
                <small>/{t("savings.year")}</small>
              </div>
            </div>
            <div className={styles.productMeta}>
              <span>{t("savings.term")}: <strong>{p.term_months} {t("savings.months")}</strong></span>
              <span>{t("savings.minAmount")}: <strong>{formatAmount(p.min_amount)} VND</strong></span>
              <span>{t("savings.earlyRate")}: <strong>{formatPercent(p.early_withdrawal_rate)}/{t("savings.year")}</strong></span>
            </div>
            <button type="button" className={styles.productAction}>
              {t("savings.openBtn")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMyAccounts = () => (
    <div className={styles.card}>
      {renderTabs()}
      <div className={styles.filterRow}>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            className={`${styles.filterChip} ${statusFilter === s ? styles.filterChipActive : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {t(`savings.filter_${s}`)}
          </button>
        ))}
      </div>
      {mySavings.length === 0 ? (
        <div className={styles.state}>{t("savings.noAccounts")}</div>
      ) : (
        <div className={styles.savingsList}>
          {mySavings.map((s) => (
            <div key={s.savings_id} className={styles.savingsRow} onClick={() => handleOpenDetail(s.savings_id)}>
              <div className={styles.savingsRowMain}>
                <div className={styles.savingsCode}>{s.savings_code}</div>
                <div className={styles.savingsProductName}>
                  {s.product_name || ""} • {formatPercent(s.interest_rate)}/{t("savings.year")} • {t("savings.maturityShort")}: {formatDate(s.maturity_date)}
                </div>
              </div>
              <div className={styles.savingsAmount}>{formatAmount(s.principal_amount)} VND</div>
              {statusBadge(s.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDepositForm = () => (
    <div className={styles.card}>
      <div>
        <button type="button" className={styles.secondaryButton} onClick={resetDepositFlow}>
          <ChevronLeft size={18} /> {t("savings.back")}
        </button>
      </div>
      <h2 className={styles.statusTitle}>{t("savings.depositTitle")}: {selectedProduct?.name}</h2>
      <form onSubmit={handleSubmitDeposit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.term")}</span>
            <span className={styles.detailValue}>{selectedProduct?.term_months} {t("savings.months")}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.rate")}</span>
            <span className={styles.detailValue}>{formatPercent(selectedProduct?.interest_rate)}/{t("savings.year")}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.minAmount")}</span>
            <span className={styles.detailValue}>{formatAmount(selectedProduct?.min_amount)} VND</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.availableBalance")}</span>
            <span className={styles.detailValue}>{formatAmount(balance)} VND</span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t("savings.amountLabel")}</label>
          <div className={styles.amountRow}>
            <div className={styles.currencyChip}>VND</div>
            <input
              className={`${styles.input} ${styles.amountInput}`}
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
            />
          </div>
          <div className={styles.quickAmounts}>
            {QUICK_AMOUNTS.map((v) => (
              <button key={v} type="button" className={styles.quickAmount} onClick={() => setAmount(String(v))}>
                {formatAmount(v)}
              </button>
            ))}
          </div>
        </div>

        {previewData && (
          <div className={styles.previewBox}>
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>{t("savings.previewPrincipal")}</span>
              <span className={styles.previewValue}>{formatAmount(previewData.principal)} VND</span>
            </div>
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>{t("savings.previewInterest")}</span>
              <span className={`${styles.previewValue} ${styles.previewHighlight}`}>
                +{formatAmount(previewData.interest_earned)} VND
              </span>
            </div>
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>{t("savings.previewFinal")}</span>
              <span className={styles.previewValue}>{formatAmount(previewData.final_amount)} VND</span>
            </div>
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>{t("savings.previewMaturity")}</span>
              <span className={styles.previewValue}>{formatDate(previewData.maturity_date)}</span>
            </div>
          </div>
        )}

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        <div className={styles.actionRow}>
          <button type="button" className={styles.secondaryButton} onClick={resetDepositFlow} disabled={loading}>
            {t("savings.cancel")}
          </button>
          <button type="submit" className={styles.primaryButton} disabled={loading || !previewData}>
            {loading ? t("common.processing") : t("savings.next")}
          </button>
        </div>
      </form>
    </div>
  );

  const renderOtp = (title, summary, onConfirm, onBack) => (
    <div className={styles.card}>
      <h2 className={styles.statusTitle}>{title}</h2>
      <div className={styles.previewBox} style={{ gridTemplateColumns: "1fr 1fr" }}>
        {summary}
      </div>
      <form onSubmit={onConfirm} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <div className={styles.field}>
          <label className={styles.label}>{t("savings.otpLabel")}</label>
          <input
            className={styles.input}
            type="password"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder={t("savings.otpPlaceholder")}
            autoFocus
            maxLength={12}
          />
        </div>
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        <div className={styles.actionRow}>
          <button type="button" className={styles.secondaryButton} onClick={onBack} disabled={loading}>
            {t("savings.back")}
          </button>
          <button type="submit" className={styles.primaryButton} disabled={loading}>
            {loading ? t("common.processing") : t("savings.confirm")}
          </button>
        </div>
      </form>
    </div>
  );

  const renderDepositOtp = () => {
    if (!initData) return null;
    const summary = (
      <>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>{t("savings.product")}</span>
          <span className={styles.previewValue}>{initData.product_name}</span>
        </div>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>{t("savings.amount")}</span>
          <span className={styles.previewValue}>{formatAmount(initData.principal)} VND</span>
        </div>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>{t("savings.expectedInterest")}</span>
          <span className={`${styles.previewValue} ${styles.previewHighlight}`}>
            +{formatAmount(initData.expected_interest)} VND
          </span>
        </div>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>{t("savings.maturityDate")}</span>
          <span className={styles.previewValue}>{formatDate(initData.expected_maturity_date)}</span>
        </div>
        <div className={styles.previewItem} style={{ gridColumn: "1 / -1" }}>
          <span className={styles.previewLabel}>{t("savings.sessionExpires")}</span>
          <span className={styles.previewValue}>{formatDateTime(initData.expires_at)}</span>
        </div>
      </>
    );
    return renderOtp(
      t("savings.confirmDepositTitle"),
      summary,
      handleConfirmDeposit,
      () => {
        setView("deposit-form");
        setOtp("");
        setErrorMessage("");
      }
    );
  };

  const renderDepositSuccess = () => {
    if (!resultData) return null;
    const s = resultData.savings;
    return (
      <div className={`${styles.statusCard} ${styles.statusSuccess}`}>
        <h2 className={styles.statusTitle}>{t("savings.successTitle")}</h2>
        <p>{t("savings.successCode")}: <strong>{resultData.transaction_code}</strong></p>
        <p>{t("savings.savingsCode")}: <strong>{s.savings_code}</strong></p>
        <p>{t("savings.amount")}: <strong>{formatAmount(s.principal_amount)} VND</strong></p>
        <p>{t("savings.maturityDate")}: <strong>{formatDate(s.maturity_date)}</strong></p>
        <p>{t("savings.newBalance")}: <strong>{formatAmount(resultData.new_balance)} VND</strong></p>
        <div className={styles.actionRow}>
          <button type="button" className={styles.secondaryButton} onClick={resetDepositFlow}>
            {t("savings.openMore")}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              resetDepositFlow();
              setTab("my");
            }}
          >
            {t("savings.viewMyAccounts")}
          </button>
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    if (!detail) return null;
    return (
      <div className={styles.card}>
        <div>
          <button type="button" className={styles.secondaryButton} onClick={resetWithdrawFlow}>
            <ChevronLeft size={18} /> {t("savings.back")}
          </button>
        </div>
        <h2 className={styles.statusTitle}>{detail.savings_code} {statusBadge(detail.status)}</h2>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.product")}</span>
            <span className={styles.detailValue}>{detail.product_name}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.principal")}</span>
            <span className={`${styles.detailValue} ${styles.detailValueLg}`}>
              {formatAmount(detail.principal_amount)} VND
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.rate")}</span>
            <span className={styles.detailValue}>{formatPercent(detail.interest_rate)}/{t("savings.year")}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.term")}</span>
            <span className={styles.detailValue}>{detail.term_months} {t("savings.months")}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.startDate")}</span>
            <span className={styles.detailValue}>{formatDate(detail.start_date)}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.maturityDate")}</span>
            <span className={styles.detailValue}>{formatDate(detail.maturity_date)}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{t("savings.daysHeld")}</span>
            <span className={styles.detailValue}>{detail.days_held} {t("savings.days")}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              {detail.status === "ACTIVE" ? t("savings.projectedInterest") : t("savings.interestEarned")}
            </span>
            <span className={`${styles.detailValue} ${styles.detailValueLg}`} style={{ color: "var(--color-success)" }}>
              +{formatAmount(
                detail.status === "ACTIVE"
                  ? detail.projected_interest_at_maturity
                  : detail.interest_earned
              )} VND
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              {detail.status === "ACTIVE" ? t("savings.projectedFinal") : t("savings.finalAmount")}
            </span>
            <span className={`${styles.detailValue} ${styles.detailValueLg}`}>
              {formatAmount(
                detail.status === "ACTIVE"
                  ? detail.projected_final_amount_at_maturity
                  : detail.final_amount
              )} VND
            </span>
          </div>
        </div>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        {detail.status === "ACTIVE" && (
          <div className={styles.actionRow}>
            <button type="button" className={styles.dangerButton} onClick={handleInitWithdraw} disabled={loading}>
              {loading ? t("common.processing") : t("savings.earlyWithdraw")}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderWithdrawOtp = () => {
    if (!withdrawInit) return null;
    const summary = (
      <>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>{t("savings.principal")}</span>
          <span className={styles.previewValue}>{formatAmount(withdrawInit.principal)} VND</span>
        </div>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>{t("savings.daysHeld")}</span>
          <span className={styles.previewValue}>{withdrawInit.days_held} {t("savings.days")}</span>
        </div>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>{t("savings.estimatedInterest")}</span>
          <span className={`${styles.previewValue} ${styles.previewHighlight}`}>
            +{formatAmount(withdrawInit.estimated_interest)} VND
          </span>
        </div>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>{t("savings.estimatedFinal")}</span>
          <span className={styles.previewValue}>{formatAmount(withdrawInit.estimated_final_amount)} VND</span>
        </div>
        <div className={styles.previewItem} style={{ gridColumn: "1 / -1" }}>
          <span className={styles.previewLabel}>{t("savings.sessionExpires")}</span>
          <span className={styles.previewValue}>{formatDateTime(withdrawInit.expires_at)}</span>
        </div>
      </>
    );
    return renderOtp(
      t("savings.confirmWithdrawTitle"),
      summary,
      handleConfirmWithdraw,
      () => {
        setView("detail");
        setOtp("");
        setErrorMessage("");
        setWithdrawInit(null);
      }
    );
  };

  const renderWithdrawSuccess = () => {
    if (!withdrawResult) return null;
    const s = withdrawResult.savings;
    return (
      <div className={`${styles.statusCard} ${styles.statusSuccess}`}>
        <h2 className={styles.statusTitle}>{t("savings.withdrawSuccessTitle")}</h2>
        <p>{t("savings.successCode")}: <strong>{withdrawResult.transaction_code}</strong></p>
        <p>{t("savings.savingsCode")}: <strong>{s.savings_code}</strong></p>
        <p>{t("savings.interestEarned")}: <strong>+{formatAmount(s.interest_earned)} VND</strong></p>
        <p>{t("savings.finalAmount")}: <strong>{formatAmount(s.final_amount)} VND</strong></p>
        <p>{t("savings.newBalance")}: <strong>{formatAmount(withdrawResult.new_balance)} VND</strong></p>
        <div className={styles.actionRow}>
          <button type="button" className={styles.primaryButton} onClick={resetWithdrawFlow}>
            {t("savings.backToList")}
          </button>
        </div>
      </div>
    );
  };

  const renderBody = () => {
    if (view === "deposit-form") return renderDepositForm();
    if (view === "deposit-otp") return renderDepositOtp();
    if (view === "deposit-success") return renderDepositSuccess();
    if (view === "detail") return renderDetail();
    if (view === "withdraw-otp") return renderWithdrawOtp();
    if (view === "withdraw-success") return renderWithdrawSuccess();
    return tab === "deposit" ? renderProductList() : renderMyAccounts();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <PiggyBank size={28} style={{ verticalAlign: "-4px", marginRight: 8 }} />
            {t("savings.pageTitle")}
          </h1>
          <p className={styles.pageSubtitle}>{t("savings.pageSubtitle")}</p>
        </div>
      </div>
      <div className={styles.content}>{renderBody()}</div>
    </div>
  );
};

export default SavingsScreen;
