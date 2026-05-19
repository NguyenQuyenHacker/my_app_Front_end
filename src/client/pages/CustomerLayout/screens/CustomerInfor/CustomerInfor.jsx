import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CustomerInfor.module.css";
import { getCustomerInfo } from "../../../../api/userApi";
import CustomerInfo from "./components/CustomerInfo";
import { clearClientToken } from "../../../../../utils/authUtils";
import { useT } from "../../../../i18n/LanguageContext";

export default function CustomerInfor() {
  const navigate = useNavigate();
  const t = useT();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getCustomerInfo();
        setCustomer(result);
      } catch (err) {
        if (err.response?.status === 401) {
          clearClientToken();
          navigate("/login");
        } else {
          console.error(err);
          setError(t("common.serverError"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, t]);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>{t("customerInfor.pageTitle")}</h1>

      {loading && <div className={styles.stateText}>{t("customerInfor.loading")}</div>}
      {!loading && error && <div className={styles.stateText}>{error}</div>}
      {!loading && !error && <CustomerInfo customer={customer} />}
    </div>
  );
}
