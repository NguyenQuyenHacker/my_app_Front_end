import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "../Signup.module.css";
import { useT } from "../../../i18n/LanguageContext";

const Field = ({ id, name, label, type = "text", value, onChange, required, autoComplete }) => {
  const isPassword = type === "password";
  const [show, setShow] = useState(false);
  const inputType = isPassword && show ? "text" : type;

  return (
    <div className={styles.field}>
      <input
        id={id}
        name={name}
        type={inputType}
        className={`${styles.input} ${isPassword ? styles.hasToggle : ""}`}
        placeholder=" "
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          title={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          tabIndex={-1}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

const SelectField = ({ id, name, label, value, onChange, options }) => (
  <div className={styles.field}>
    <select
      id={id}
      name={name}
      className={`${styles.input} ${styles.select}`}
      value={value}
      onChange={onChange}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <label htmlFor={id} className={`${styles.label} ${styles.labelStatic}`}>
      {label}
    </label>
  </div>
);

const SignupForm = ({
  step,
  formData,
  handleChange,
  handleSubmit,
  goNext,
  goBack,
  loading,
  error,
  onBackToLogin,
}) => {
  const t = useT();

  const renderStep1 = () => (
    <>
      <Field
        id="full_name"
        name="full_name"
        label={t("signup.fieldFullName")}
        value={formData.full_name}
        onChange={handleChange}
        required
        autoComplete="name"
      />

      <Field
        id="cccd_number"
        name="cccd_number"
        label={t("signup.fieldCccd")}
        value={formData.cccd_number}
        onChange={handleChange}
        required
      />

      <Field
        id="date_of_birth"
        name="date_of_birth"
        type="date"
        label={t("signup.fieldDob")}
        value={formData.date_of_birth}
        onChange={handleChange}
        required
      />

      <SelectField
        id="gender"
        name="gender"
        label={t("signup.fieldGender")}
        value={formData.gender}
        onChange={handleChange}
        options={[
          { value: "MALE", label: t("signup.genderMale") },
          { value: "FEMALE", label: t("signup.genderFemale") },
        ]}
      />

      <Field
        id="identity_issue_date"
        name="identity_issue_date"
        type="date"
        label={t("signup.fieldIssueDate")}
        value={formData.identity_issue_date}
        onChange={handleChange}
      />

      <Field
        id="identity_expiry_date"
        name="identity_expiry_date"
        type="date"
        label={t("signup.fieldExpiryDate")}
        value={formData.identity_expiry_date}
        onChange={handleChange}
      />

      <Field
        id="identity_issue_place"
        name="identity_issue_place"
        label={t("signup.fieldIssuePlace")}
        value={formData.identity_issue_place}
        onChange={handleChange}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Field
        id="permanent_address"
        name="permanent_address"
        label={t("signup.fieldPermAddress")}
        value={formData.permanent_address}
        onChange={handleChange}
        required
      />

      <Field
        id="current_address"
        name="current_address"
        label={t("signup.fieldCurrAddress")}
        value={formData.current_address}
        onChange={handleChange}
        required
      />

      <Field
        id="occupation"
        name="occupation"
        label={t("signup.fieldOccupation")}
        value={formData.occupation}
        onChange={handleChange}
        required
      />
    </>
  );

  const renderStep3 = () => (
    <>
      <Field
        id="phone"
        name="phone"
        type="tel"
        label={t("signup.fieldPhone")}
        value={formData.phone}
        onChange={handleChange}
        required
        autoComplete="tel"
      />

      <Field
        id="email"
        name="email"
        type="email"
        label={t("signup.fieldEmail")}
        value={formData.email}
        onChange={handleChange}
        autoComplete="email"
      />

      <Field
        id="password"
        name="password"
        type="password"
        label={t("signup.fieldPassword")}
        value={formData.password}
        onChange={handleChange}
        required
        autoComplete="new-password"
      />

      <Field
        id="confirm_password"
        name="confirm_password"
        type="password"
        label={t("signup.fieldConfirmPassword")}
        value={formData.confirm_password}
        onChange={handleChange}
        required
        autoComplete="new-password"
      />

      <p className={styles.hint}>{t("signup.passwordHint")}</p>

      <div className={styles.sectionDivider}>
        <span>{t("signup.pinSection")}</span>
      </div>

      <Field
        id="pin"
        name="pin"
        type="password"
        label={t("signup.fieldPin")}
        value={formData.pin}
        onChange={handleChange}
        required
        autoComplete="new-password"
      />

      <Field
        id="confirm_pin"
        name="confirm_pin"
        type="password"
        label={t("signup.fieldConfirmPin")}
        value={formData.confirm_pin}
        onChange={handleChange}
        required
        autoComplete="new-password"
      />

      <p className={styles.hint}>{t("signup.pinHint")}</p>
    </>
  );

  const stepTitle = t(`signup.step${step}Title`);
  const stepDesc = t(`signup.step${step}Desc`);

  return (
    <section className={styles.panel}>
      <div className={styles.card}>
        <header className={styles.cardHead}>
          <div className={styles.progressBar} aria-hidden="true">
            <span
              className={styles.progressFill}
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <p className={styles.stepCount}>
            {t("signup.stepLabel")} {step}/3
          </p>
          <h2>{stepTitle}</h2>
          <p>{stepDesc}</p>
        </header>

        {error && (
          <div className={styles.errorAlert} role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className={styles.actions}>
            {step > 1 ? (
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={goBack}
                disabled={loading}
              >
                {t("signup.backBtn")}
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={onBackToLogin}
                disabled={loading}
              >
                {t("signup.backToLogin")}
              </button>
            )}

            {step < 3 ? (
              <button type="button" className={styles.btnPrimary} onClick={goNext}>
                {t("signup.nextBtn")}
              </button>
            ) : (
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading && <span className={styles.spinner} aria-hidden="true" />}
                {loading ? t("signup.submitting") : t("signup.submitBtn")}
              </button>
            )}
          </div>

          <p className={styles.fineprint}>
            {t("signup.fineprint")}{" "}
            <a href="#" className={styles.link}>
              {t("signup.fineprintLink")}
            </a>
            .
          </p>
        </form>
      </div>
    </section>
  );
};

export default SignupForm;
