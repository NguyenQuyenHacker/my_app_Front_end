import React from "react";
import styles from "./CustomerInfo.module.css";
import { formatDate } from "../../../../../utils/formatDate";

export default function CustomerInfo({ customer }) {
  if (!customer) return null;

  const infoItems = [
    {
      icon: "phone",
      label: "Số điện thoại",
      value: customer.phone,
    },
    {
      icon: "mail",
      label: "Email",
      value: customer.email,
    },
    {
      icon: "home",
      label: "Thường trú",
      value: customer.permanent_address,
    },
    {
      icon: "location_on",
      label: "Hiện tại",
      value: customer.current_address,
    },
    {
      icon: "cake",
      label: "Ngày sinh",
      value: formatDate(customer.dob),
    },
    {
      icon: "wc",
      label: "Giới tính",
      value: customer.gender,
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.glow} />

      <div className={styles.contentWrap}>
        <div className={styles.headerBlock}>
          <h1 className={styles.title}>{customer.full_name}</h1>
        </div>

        <div className={styles.metaGrid}>
          {infoItems.map((item) => (
            <div className={styles.metaCard} key={item.label}>
              <div className={styles.iconWrap}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>

              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>{item.label}</span>
                <span className={styles.metaValue}>{item.value || "--"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}