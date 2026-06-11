import React from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "./CustomerHomePage.module.css";
import { getCustomerHomePage } from "../../../../api/userApi";
import CustomerService from "./components/CustomerService";
import { useT } from "../../../../i18n/LanguageContext";

export default function CustomerHomePage() {
  const t = useT();
  const { data: home, isLoading, isError } = useQuery({
    queryKey: ["customerHomePage"],
    queryFn: getCustomerHomePage,
  });

  if (isLoading) {
    return <div className={styles.wrapper}>{t("home.loading")}</div>;
  }

  if (isError) {
    return <div className={styles.wrapper}>{t("common.serverError")}</div>;
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
