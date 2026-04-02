import React from "react";
import styles from "./AdminOverview.module.css";

const stats = [
  { label: "Total Users", value: 5, note: "1 user mapped to 1 customer" },
  { label: "Active Users", value: 4, note: "Có thể đăng nhập hệ thống" },
  { label: "Locked Users", value: 1, note: "Đang bị khóa truy cập" },
  { label: "Documents", value: 3, note: "Mock AI/RAG knowledge files" },
];

const recentDocs = [
  {
    id: "doc_001",
    name: "Techcombank_Annual_Report_2024.pdf",
    status: "Indexed",
    time: "27/03/2026 09:15",
  },
  {
    id: "doc_002",
    name: "Loan_Policy_FRQ.docx",
    status: "Processing",
    time: "27/05/2026 10:02",
  },
  {
    id: "doc_003",
    name: "Savings_Product_Guide.pdf",
    status: "Indexed",
    time: "27/03/2026 10:45",
  },
];

const snapshots = [
  { label: "User Management", value: "Ready" },
  { label: "Admin Authentication", value: "Ready" },
  { label: "RAG Upload UI", value: "Mock" },
  { label: "Analytics", value: "Planned" },
];

export default function AdminOverview() {
  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <p className={styles.eyebrow}>TCBS ADMIN CONSOLE</p>
        <h1 className={styles.pageTitle}>Admin Overview</h1>
        <p className={styles.pageDesc}>
          Tổng quan hệ thống quản trị người dùng và AI/RAG nội bộ.
        </p>
      </section>

      <section className={styles.statsGrid}>
        {stats.map((item, index) => (
          <div key={item.label} className={styles.statCard}>
            <div className={`${styles.statAccent} ${styles[`accent${index + 1}`]}`} />
            <span className={styles.statLabel}>{item.label}</span>
            <strong className={styles.statValue}>{item.value}</strong>
            <p className={styles.statNote}>{item.note}</p>
          </div>
        ))}
      </section>

      <section className={styles.bottomGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>System Snapshot</h2>
              <p>Thông tin nhanh về admin module.</p>
            </div>
          </div>

          <div className={styles.infoList}>
            {snapshots.map((item) => (
              <div key={item.label} className={styles.infoItem}>
                <span className={styles.infoLabel}>{item.label}</span>
                <strong className={styles.infoValue}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Recent Documents</h2>
              <p>Mock danh sách tài liệu gần đây.</p>
            </div>
          </div>

          <div className={styles.docList}>
            {recentDocs.map((doc) => (
              <div key={doc.id} className={styles.docItem}>
                <div className={styles.docMeta}>
                  <div className={styles.docName}>{doc.name}</div>
                  <div className={styles.docTime}>{doc.time}</div>
                </div>

                <span
                  className={
                    doc.status === "Indexed"
                      ? `${styles.docStatus} ${styles.indexed}`
                      : `${styles.docStatus} ${styles.processing}`
                  }
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}