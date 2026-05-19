import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { loginUser } from "../../api/userApi";
import Brand from "./components/Login_brand";
import LoginForm from "./components/Login_form";
import { setClientToken } from "../../../utils/authUtils";
import { useT } from "../../i18n/LanguageContext";


const Login = () => {
  const navigate = useNavigate();
  const t = useT();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // Auto-hide error toast
  // =========================
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // =========================
  // Handle input change
  // =========================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================
  // Validate phone
  // =========================
  const isValidVietnamPhone = (phone) => {
    const regex = /^0\d{9}$/;
    return regex.test(phone);
  };

  // =========================
  // Handle submit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidVietnamPhone(formData.phone)) {
      alert(t("login.invalidPhone"));
      return;
    }

    if (!formData.password) {
      alert(t("login.missingPassword"));
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear previous errors

      const result = await loginUser(
        formData.phone,
        formData.password
      );

      if (result?.access_token) {
        setClientToken(result.access_token);
        navigate("/customer");
      } else {
        throw new Error("No access token received");
      }

    } catch (error) {
      let errorMessage = error.response?.data?.detail || t("login.invalidCredentials");

      if (errorMessage === "ACCOUNT_LOCKED") {
        errorMessage = t("login.accountLocked");
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.authContainer}>
      <Brand />
      <LoginForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </main>
  );
};

export default Login;