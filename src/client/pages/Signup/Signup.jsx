import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./Signup.module.css";
import { registerUser } from "../../api/userApi";
import { setClientToken } from "../../../utils/authUtils";
import { useT } from "../../i18n/LanguageContext";

import SignupBrand from "./components/Signup_brand";
import SignupForm from "./components/Signup_form";

const INITIAL_FORM = {
  full_name: "",
  cccd_number: "",
  date_of_birth: "",
  gender: "MALE",

  permanent_address: "",
  current_address: "",
  occupation: "",

  email: "",
  phone: "",
  password: "",
  confirm_password: "",
  pin: "",
  confirm_pin: "",

  identity_issue_date: "",
  identity_expiry_date: "",
  identity_issue_place: "",
};

const ERROR_MAP = {
  PHONE_ALREADY_REGISTERED: "signup.errPhoneTaken",
  CCCD_ALREADY_REGISTERED: "signup.errCccdTaken",
  EMAIL_ALREADY_REGISTERED: "signup.errEmailTaken",
};

const Signup = () => {
  const navigate = useNavigate();
  const t = useT();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (formData.full_name.trim().length < 2) return t("signup.errName");
    if (!/^\d{9,12}$/.test(formData.cccd_number)) return t("signup.errCccd");
    if (!formData.date_of_birth) return t("signup.errDob");
    if (!formData.gender) return t("signup.errGender");
    return null;
  };

  const validateStep2 = () => {
    if (formData.permanent_address.trim().length < 2) return t("signup.errPermAddress");
    if (formData.current_address.trim().length < 2) return t("signup.errCurrAddress");
    if (formData.occupation.trim().length < 1) return t("signup.errOccupation");
    return null;
  };

  const validateStep3 = () => {
    if (!/^0\d{9}$/.test(formData.phone)) return t("signup.errPhone");
    if (formData.password.length < 8) return t("signup.errPasswordShort");
    if (!/[A-Z]/.test(formData.password) || !/\d/.test(formData.password))
      return t("signup.errPasswordWeak");
    if (formData.password !== formData.confirm_password)
      return t("signup.errPasswordMismatch");
    if (!/^\d{6}$/.test(formData.pin)) return t("signup.errPin");
    if (formData.pin !== formData.confirm_pin) return t("signup.errPinMismatch");
    return null;
  };

  const goNext = () => {
    let msg = null;
    if (step === 1) msg = validateStep1();
    else if (step === 2) msg = validateStep2();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validateStep3();
    if (msg) {
      setError(msg);
      return;
    }

    const payload = {
      full_name: formData.full_name.trim(),
      cccd_number: formData.cccd_number.trim(),
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      permanent_address: formData.permanent_address.trim(),
      current_address: formData.current_address.trim(),
      occupation: formData.occupation.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      pin: formData.pin,
    };

    if (formData.email.trim()) payload.email = formData.email.trim();
    if (formData.identity_issue_date) payload.identity_issue_date = formData.identity_issue_date;
    if (formData.identity_expiry_date) payload.identity_expiry_date = formData.identity_expiry_date;
    if (formData.identity_issue_place.trim())
      payload.identity_issue_place = formData.identity_issue_place.trim();

    try {
      setLoading(true);
      setError("");
      const result = await registerUser(payload);

      if (result?.access_token) {
        setClientToken(result.access_token);
        navigate("/customer");
      } else {
        throw new Error("No access token");
      }
    } catch (err) {
      const detail = err?.response?.data?.detail;
      let message;
      if (typeof detail === "string" && ERROR_MAP[detail]) {
        message = t(ERROR_MAP[detail]);
      } else if (Array.isArray(detail)) {
        message = detail[0]?.msg || t("signup.errGeneric");
      } else if (typeof detail === "string") {
        message = detail;
      } else {
        message = t("signup.errGeneric");
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.authContainer}>
      <SignupBrand step={step} />
      <SignupForm
        step={step}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        goNext={goNext}
        goBack={goBack}
        loading={loading}
        error={error}
        onBackToLogin={() => navigate("/login")}
      />
    </main>
  );
};

export default Signup;
