import React from "react";
import styles from "./CustomerInfo.module.css";
import { formatDate } from "../../../../../utils/formatDate";
import { useT } from "../../../../../i18n/LanguageContext";

function InfoField({ label, value, badge }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {badge ? (
        <span className={styles.badge}>{badge}</span>
      ) : (
        <span className={styles.value}>{value || "--"}</span>
      )}
    </div>
  );
}

export default function CustomerInfo({ customer }) {
  const t = useT();
  if (!customer) return null;

  return (
    <div className={styles.card}>
      <div className={styles.grid}>
        <InfoField label={t("customerInfor.fullName")} value={customer.full_name} />
        <InfoField label={t("customerInfor.email")} value={customer.email} />

        <InfoField label={t("customerInfor.username")} value={customer.phone} />
        <InfoField label={t("customerInfor.cccd")} value={customer.cccd_number} />

        <InfoField label={t("customerInfor.dob")} value={formatDate(customer.dob)} />
        <InfoField label={t("customerInfor.issueDate")} value={formatDate(customer.identity_issue_date)} />

        <InfoField label={t("customerInfor.expiryDate")} value={formatDate(customer.identity_expiry_date)} />
        <InfoField label={t("customerInfor.phone")} value={customer.phone} />

        <InfoField label={t("customerInfor.issuePlace")} value={customer.identity_issue_place} />
        <InfoField
          label={t("customerInfor.biometric")}
          badge={customer.biometric_verified ? t("customerInfor.biometricYes") : t("customerInfor.biometricNo")}
        />
      </div>
    </div>
  );
}
