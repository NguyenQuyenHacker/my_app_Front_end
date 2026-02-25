import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CustomerOverview.module.css";
import { getCurrentUser } from "../../../../api/userApi";
import CustomerInfo from "./components/CustomerInfo";
import CustomerService from "./components/CustomerService";

export default function CustomerOverview() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getCurrentUser();

        setCustomer(result);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          console.error(err);
          setError("Server error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className={styles.wrapper}>Đang tải dữ liệu khách hàng...</div>;
  }

  if (error) {
    return <div className={styles.wrapper}>{error}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <CustomerInfo customer={customer} />
      <CustomerService />
    </div>
  );
}