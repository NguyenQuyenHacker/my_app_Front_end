import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getAccountOverview } from "../../../../api/accountApi";
import styles from "./AccountScreen.module.css";

import AccountSummary from "./components/AccountSummary";
import AccountCard from "./components/AccountCard";
import AccountList from "./components/AccountList";
import TransactionList from "./components/TransactionList";

const AccountScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const currentView = searchParams.get("view") || "overview";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getAccountOverview();
        setData(result);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        console.error(error);
        setErrorMessage("Không thể tải dữ liệu tài khoản.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const customer = data?.customer || null;
  const account = data?.account || null;
  const card = data?.card || null;
  const entries = data?.entries || [];

  const recentEntries = useMemo(() => entries.slice(0,), [entries]);

  if (loading) {
    return <div className={styles.state}>Đang tải dữ liệu...</div>;
  }

  if (errorMessage) {
    return <div className={styles.error}>{errorMessage}</div>;
  }

  if (!account) {
    return <div className={styles.state}>Không có dữ liệu tài khoản.</div>;
  }

  return (
    <div className={styles.wrapper}>
      {currentView === "overview" && (
        <>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Tài khoản của bạn</h1>
              <p className={styles.pageSubtitle}>
                Quản lý thông tin tài khoản, thẻ và số dư
              </p>
            </div>
          </div>

          <div className={styles.topSection}>
            <AccountSummary
              fullName={customer?.full_name || ""}
              account={account}
            />

            {card ? (
              <AccountCard
                fullName={customer?.full_name || ""}
                card={card}
                bankName={account.bank_name}
              />
            ) : (
              <div className={styles.noCard}>Chưa có dữ liệu thẻ.</div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.actionRow}>
              <Link
                to="/customer/accounts?view=transactions"
                className={styles.primaryButton}
              >
                Xem lịch sử giao dịch
              </Link>

              <Link 
                to="/customer/transfer" 
                className={styles.secondaryButton}
              >
                Chuyển tiền
              </Link>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => window.location.reload()}
              >
                Tải lại
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <AccountList account={account} />
          </div>
        </>
      )}

      {currentView === "transactions" && (
        <div className={styles.section}>
          <div className={styles.viewHeader}>
            <div>
              <h2 className={styles.viewTitle}>Lịch sử giao dịch</h2>
              <p className={styles.viewSubtitle}>
                Tài khoản {account.account_no}
              </p>
            </div>

            <Link
              to="/customer/accounts?view=overview"
              className={styles.backButton}
            >
              Quay lại tài khoản
            </Link>
          </div>

          <TransactionList
            entries={recentEntries}
            currency={account.currency}
          />
        </div>
      )}
    </div>
  );
};

export default AccountScreen;