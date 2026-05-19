import React, { useEffect, useMemo, useState } from "react";
import { getCustomerInfo } from "../../../../../api/userApi";
import { updateProfile } from "../../../../../api/settingsApi";
import ConfirmPasswordModal from "../components/ConfirmPasswordModal";
import { useT } from "../../../../../i18n/LanguageContext";
import styles from "./SettingsProfile.module.css";

const EDITABLE_KEYS = [
  { name: "full_name", labelKey: "settings.fieldFullName" },
  { name: "email", labelKey: "settings.fieldEmail", type: "email" },
  { name: "phone", labelKey: "settings.fieldPhone" },
  { name: "current_address", labelKey: "settings.fieldCurrentAddress" },
];

const READONLY_KEYS = [
  { name: "cccd_number", labelKey: "settings.fieldCccd" },
  { name: "dob", labelKey: "settings.fieldDob" },
  { name: "gender", labelKey: "settings.fieldGender" },
  { name: "permanent_address", labelKey: "settings.fieldPermAddress" },
  { name: "identity_issue_date", labelKey: "settings.fieldIssueDate" },
  { name: "identity_expiry_date", labelKey: "settings.fieldExpiryDate" },
  { name: "identity_issue_place", labelKey: "settings.fieldIssuePlace" },
];

const getInitials = (name) => {
  if (!name) return "KH";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

const formatDisplay = (value) => {
  if (!value) return "—";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10).split("-").reverse().join("/");
  }
  return String(value);
};

export default function SettingsProfile() {
  const t = useT();
  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getCustomerInfo();
        setCustomer(data);
        setForm({
          full_name: data.full_name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          current_address: data.current_address ?? "",
        });
      } catch (e) {
        setError(t("settings.profileLoadError"));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const dirtyDiff = useMemo(() => {
    if (!customer) return {};
    const diff = {};
    for (const { name } of EDITABLE_KEYS) {
      if ((form[name] ?? "") !== (customer[name] ?? "")) {
        diff[name] = form[name];
      }
    }
    return diff;
  }, [customer, form]);

  const isDirty = Object.keys(dirtyDiff).length > 0;

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
  };

  const handleReset = () => {
    if (!customer) return;
    setForm({
      full_name: customer.full_name ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      current_address: customer.current_address ?? "",
    });
    setSuccess("");
  };

  const handleSaveClick = () => {
    if (!isDirty) return;
    setModalError("");
    setModalOpen(true);
  };

  const handleConfirmSave = async (password) => {
    setModalLoading(true);
    setModalError("");
    try {
      const updated = await updateProfile({ password, ...dirtyDiff });
      setCustomer(updated);
      setForm({
        full_name: updated.full_name ?? "",
        email: updated.email ?? "",
        phone: updated.phone ?? "",
        current_address: updated.current_address ?? "",
      });
      setModalOpen(false);
      setSuccess(t("settings.profileSuccess"));
    } catch (err) {
      const detail =
        err.response?.data?.detail || t("settings.profileUpdateFail");
      setModalError(detail);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.state}>{t("common.loading")}</div>;
  }
  if (error) {
    return <div className={styles.state}>{error}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.avatar}>{getInitials(customer?.full_name)}</div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>{customer?.full_name}</div>
          <div className={styles.headerSub}>{customer?.phone}</div>
        </div>
      </div>

      {success && <div className={styles.success}>{success}</div>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("settings.profileEditable")}</h2>
        <div className={styles.grid}>
          {EDITABLE_KEYS.map(({ name, labelKey, type = "text" }) => (
            <label key={name} className={styles.field}>
              <span className={styles.label}>{t(labelKey)}</span>
              <input
                type={type}
                value={form[name] ?? ""}
                onChange={(e) => handleChange(name, e.target.value)}
                className={styles.input}
              />
            </label>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("settings.profileKyc")}</h2>
        <div className={styles.grid}>
          {READONLY_KEYS.map(({ name, labelKey }) => (
            <div key={name} className={styles.field}>
              <span className={styles.label}>{t(labelKey)}</span>
              <div className={styles.readonlyValue}>
                {formatDisplay(customer?.[name])}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleReset}
          className={styles.btnGhost}
          disabled={!isDirty}
        >
          {t("settings.cancelBtn")}
        </button>
        <button
          type="button"
          onClick={handleSaveClick}
          className={styles.btnPrimary}
          disabled={!isDirty}
        >
          {t("settings.saveBtn")}
        </button>
      </div>

      <ConfirmPasswordModal
        open={modalOpen}
        loading={modalLoading}
        error={modalError}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}
