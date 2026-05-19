import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useT } from "../../../../../i18n/LanguageContext";
import styles from "./ConfirmPasswordModal.module.css";

export default function ConfirmPasswordModal({
  open,
  title,
  description,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const t = useT();
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) setPassword("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    onConfirm(password);
  };

  const finalTitle = title || t("settings.confirmTitle");
  const finalDesc = description || t("settings.confirmDesc");

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className={styles.header}>
          <h3>{finalTitle}</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label={t("common.close")}
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.body}>
          <p className={styles.desc}>{finalDesc}</p>

          <label className={styles.label}>
            {t("settings.confirmInput")}
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={onCancel}
              disabled={loading}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading || !password}
            >
              {loading ? t("common.processing") : t("common.confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
