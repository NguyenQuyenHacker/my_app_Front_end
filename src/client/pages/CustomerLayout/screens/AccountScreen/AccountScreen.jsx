import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getAccountOverview } from "../../../../api/accountApi";
import styles from "./AccountScreen.module.css";
import { clearClientToken } from "../../../../../utils/authUtils";
import { useT } from "../../../../i18n/LanguageContext";

import AccountSummary from "./components/AccountSummary";
import AccountCard from "./components/AccountCard";
import AccountList from "./components/AccountList";
import TransactionList from "./components/TransactionList";

const AccountScreen = () => {
  const navigate = useNavigate();
  const t = useT();
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
          clearClientToken();
          navigate("/login");
          return;
        }

        console.error(error);
        setErrorMessage(t("account.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, t]);

  const customer = data?.customer || null;
  const account = data?.account || null;
  const card = data?.card || null;
  const entries = data?.transactions || data?.entries || [];

  const recentEntries = useMemo(() => entries.slice(0,), [entries]);

  if (loading) {
    return <div className={styles.state}>{t("account.loading")}</div>;
  }

  if (errorMessage) {
    return <div className={styles.error}>{errorMessage}</div>;
  }

  if (!account) {
    return <div className={styles.state}>{t("account.empty")}</div>;
  }

  return (
    <div className={styles.wrapper}>
      {currentView === "overview" && (
        <>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>{t("account.pageTitle")}</h1>
              <p className={styles.pageSubtitle}>{t("account.pageSubtitle")}</p>
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
              <div className={styles.noCard}>{t("account.noCard")}</div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.actionRow}>
              <Link
                to="/customer/accounts?view=transactions"
                className={styles.primaryButton}
              >
                {t("account.viewTransactions")}
              </Link>

              <Link
                to="/customer/transfer"
                className={styles.secondaryButton}
              >
                {t("account.transfer")}
              </Link>
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
              <h2 className={styles.viewTitle}>{t("account.txHistoryTitle")}</h2>
              <p className={styles.viewSubtitle}>
                {t("account.accountLabel")} {account.account_no}
              </p>
            </div>

            <Link
              to="/customer/accounts?view=overview"
              className={styles.backButton}
            >
              {t("account.backToAccount")}
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
