import React, { useEffect, useState } from "react";
import styles from "./AccountScreen.module.css";
import AccountSummary from "./components/AccountSummary";
import AccountList from "./components/AccountList";
// import { getCustomerAccounts } from "../../../../api/userApi";

export default function AccountScreen() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError("");

        // Thay bằng API thật sau:
        // const result = await getCustomerAccounts();
        // setAccounts(result.accounts);

        setAccounts([
          {
            account_id: "1",
            account_no: "19031234567890",
            type: "CHECKING",
            status: "ACTIVE",
            currency: "VND",
            opened_at: "2024-01-10T08:00:00Z",
            balance: 1750000000,
          },
          {
            account_id: "2",
            account_no: "19039876543210",
            type: "SAVINGS",
            status: "ACTIVE",
            currency: "VND",
            opened_at: "2024-06-20T08:00:00Z",
            balance: 500000000,
          },
          {
            account_id: "3",
            account_no: "19030000111122",
            type: "TERM",
            status: "FROZEN",
            currency: "VND",
            opened_at: "2023-11-03T08:00:00Z",
            balance: 250000000,
          },
        ]);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách tài khoản.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return <div className={styles.wrapper}>Đang tải dữ liệu tài khoản...</div>;
  }

  if (error) {
    return <div className={styles.wrapper}>{error}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <AccountSummary accounts={accounts} />
      <AccountList accounts={accounts} />
    </div>
  );
}