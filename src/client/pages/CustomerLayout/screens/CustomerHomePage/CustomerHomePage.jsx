import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CustomerHomePage.module.css";
import { getCustomerHomePage } from "../../../../api/userApi";
import CustomerService from "./components/CustomerService";
import { clearClientToken } from "../../../../../utils/authUtils";
import { useT } from "../../../../i18n/LanguageContext";

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const t = useT();
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getCustomerHomePage();
        setHome(result);
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
  }, [navigate]);

  if (loading) {
    return <div className={styles.wrapper}>{t("home.loading")}</div>;
  }

  if (error) {
    return <div className={styles.wrapper}>{error}</div>;
  }

  return (
    <div className={styles.wrapper}>
      {home?.greeting_name && (
        <div className={styles.greetingBlock}>
          <span className={styles.greetingLabel}>{t("home.greeting")}</span>
          <h1 className={styles.greetingName}>{home.greeting_name}</h1>
        </div>
      )}
      <CustomerService home={home} />
    </div>
  );
}
