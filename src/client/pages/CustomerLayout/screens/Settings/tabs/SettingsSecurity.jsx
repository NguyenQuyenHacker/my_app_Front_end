import React, { useEffect, useState } from "react";
import {
  changePassword,
  changePin,
  getLastLogin,
} from "../../../../../api/settingsApi";
import { getAccountOverview } from "../../../../../api/accountApi";
import { useLanguage } from "../../../../../i18n/LanguageContext";
import styles from "./SettingsSecurity.module.css";

const passwordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const formatDateTime = (iso, locale) => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleString(locale === "en" ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function SettingsSecurity() {
  const { language, t } = useLanguage();

  const strengthLabels = [
    t("settings.strengthVeryWeak"),
    t("settings.strengthWeak"),
    t("settings.strengthMedium"),
    t("settings.strengthStrong"),
    t("settings.strengthVeryStrong"),
  ];

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState({ text: "", ok: false });
  const [pwdLoading, setPwdLoading] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [accLoading, setAccLoading] = useState(true);
  const [pinForm, setPinForm] = useState({});
  const [pinMsg, setPinMsg] = useState({});
  const [pinLoading, setPinLoading] = useState({});

  const [lastLogin, setLastLogin] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAccountOverview();
        const list = Array.isArray(data) ? data : data?.accounts ?? [];
        setAccounts(list);
      } catch {
        setAccounts([]);
      } finally {
        setAccLoading(false);
      }
    })();

    (async () => {
      try {
        const data = await getLastLogin();
        setLastLogin(data?.last_login_at ?? null);
      } catch {
        setLastLogin(null);
      }
    })();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ text: "", ok: false });

    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ text: t("settings.pwdMismatch"), ok: false });
      return;
    }
    if (passwordStrength(pwd.next) < 3) {
      setPwdMsg({ text: t("settings.pwdWeak"), ok: false });
      return;
    }

    setPwdLoading(true);
    try {
      await changePassword({
        current_password: pwd.current,
        new_password: pwd.next,
      });
      setPwd({ current: "", next: "", confirm: "" });
      setPwdMsg({ text: t("settings.pwdSuccess"), ok: true });
    } catch (err) {
      setPwdMsg({
        text: err.response?.data?.detail || t("settings.pwdFail"),
        ok: false,
      });
    } finally {
      setPwdLoading(false);
    }
  };

  const updatePinField = (accountId, field, value) => {
    setPinForm((prev) => ({
      ...prev,
      [accountId]: { ...(prev[accountId] || {}), [field]: value },
    }));
  };

  const handleChangePin = async (e, accountId) => {
    e.preventDefault();
    const f = pinForm[accountId] || {};
    setPinMsg((prev) => ({ ...prev, [accountId]: { text: "", ok: false } }));

    if (!f.current || !f.next || !f.confirm) {
      setPinMsg((prev) => ({
        ...prev,
        [accountId]: { text: t("settings.pinMissing"), ok: false },
      }));
      return;
    }
    if (f.next !== f.confirm) {
      setPinMsg((prev) => ({
        ...prev,
        [accountId]: { text: t("settings.pinMismatch"), ok: false },
      }));
      return;
    }
    if (!/^\d{4,12}$/.test(f.next)) {
      setPinMsg((prev) => ({
        ...prev,
        [accountId]: { text: t("settings.pinFormat"), ok: false },
      }));
      return;
    }

    setPinLoading((prev) => ({ ...prev, [accountId]: true }));
    try {
      await changePin({
        account_id: accountId,
        current_pin: f.current,
        new_pin: f.next,
      });
      setPinForm((prev) => ({ ...prev, [accountId]: {} }));
      setPinMsg((prev) => ({
        ...prev,
        [accountId]: { text: t("settings.pinSuccess"), ok: true },
      }));
    } catch (err) {
      setPinMsg((prev) => ({
        ...prev,
        [accountId]: {
          text: err.response?.data?.detail || t("settings.pinFail"),
          ok: false,
        },
      }));
    } finally {
      setPinLoading((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  const strength = passwordStrength(pwd.next);
  const lastLoginText = formatDateTime(lastLogin, language) || t("settings.lastLoginEmpty");

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("settings.changePasswordTitle")}</h2>
        <form onSubmit={handleChangePassword} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>{t("settings.currentPassword")}</span>
            <input
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{t("settings.newPassword")}</span>
            <input
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              className={styles.input}
              required
            />
            {pwd.next && (
              <div className={styles.strengthRow}>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    data-level={strength}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  />
                </div>
                <span className={styles.strengthText}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{t("settings.confirmPassword")}</span>
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className={styles.input}
              required
            />
          </label>

          {pwdMsg.text && (
            <div className={pwdMsg.ok ? styles.success : styles.error}>
              {pwdMsg.text}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={pwdLoading}
            >
              {pwdLoading ? t("settings.changingPassword") : t("settings.changePasswordBtn")}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("settings.changePinTitle")}</h2>
        <p className={styles.sectionDesc}>{t("settings.changePinDesc")}</p>

        {accLoading ? (
          <div className={styles.muted}>{t("settings.loadingAccounts")}</div>
        ) : accounts.length === 0 ? (
          <div className={styles.muted}>{t("settings.noAccount")}</div>
        ) : (
          <div className={styles.accountList}>
            {accounts.map((acc) => {
              const id = acc.account_id;
              const f = pinForm[id] || {};
              const msg = pinMsg[id];
              return (
                <form
                  key={id}
                  onSubmit={(e) => handleChangePin(e, id)}
                  className={styles.accountCard}
                >
                  <div className={styles.accountHeader}>
                    <div>
                      <div className={styles.accountNo}>{acc.account_no}</div>
                      <div className={styles.accountBank}>
                        {acc.bank_name || "TCB"}
                      </div>
                    </div>
                  </div>

                  <div className={styles.pinGrid}>
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder={t("settings.currentPin")}
                      value={f.current || ""}
                      onChange={(e) =>
                        updatePinField(id, "current", e.target.value)
                      }
                      className={styles.input}
                    />
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder={t("settings.newPin")}
                      value={f.next || ""}
                      onChange={(e) =>
                        updatePinField(id, "next", e.target.value)
                      }
                      className={styles.input}
                    />
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder={t("settings.confirmPin")}
                      value={f.confirm || ""}
                      onChange={(e) =>
                        updatePinField(id, "confirm", e.target.value)
                      }
                      className={styles.input}
                    />
                  </div>

                  {msg?.text && (
                    <div className={msg.ok ? styles.success : styles.error}>
                      {msg.text}
                    </div>
                  )}

                  <div className={styles.actions}>
                    <button
                      type="submit"
                      className={styles.btnPrimary}
                      disabled={pinLoading[id]}
                    >
                      {pinLoading[id] ? t("common.processing") : t("settings.changePinBtn")}
                    </button>
                  </div>
                </form>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("settings.lastLoginTitle")}</h2>
        <div className={styles.lastLoginCard}>
          <div className={styles.lastLoginLabel}>{t("settings.lastLoginTime")}</div>
          <div className={styles.lastLoginValue}>{lastLoginText}</div>
        </div>
      </section>
    </div>
  );
}
