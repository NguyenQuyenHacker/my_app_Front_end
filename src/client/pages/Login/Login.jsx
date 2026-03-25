
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import styles from './Login.module.css';
// import { loginUser } from '../../api/userApi';

// import Brand from './components/Login_brand';
// import LoginForm from './components/Login_form';

// const Login = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     phone: '',
//     password: '',
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };
  
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   // validate phone
//   if (!isValidVietnamPhone(formData.phone)) {
//     alert("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0");
//     return;
//   }

//   try {
//     const result = await loginUser(
//       formData.phone,
//       formData.password
//     );

//     console.log("LOGIN RESPONSE:", result);

//     // lưu token
//     localStorage.setItem("token", result.access_token);

//     // navigate('/dashboard');

//   } catch (error) {
//     console.error("LOGIN ERROR:", error);
//     alert("Sai số điện thoại hoặc mật khẩu");
//   }
// };

// const isValidVietnamPhone = (phone) => {
//   const regex = /^0\d{9}$/;
//   return regex.test(phone);
// };


//   return (
//     <main className={styles.authContainer}>
//       <Brand />
//       <LoginForm
//         formData={formData}
//         handleChange={handleChange}
//         handleSubmit={handleSubmit}
//       />
//     </main>
//   );
// };

// export default Login;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { loginUser } from "../../api/userApi";
import Brand from "./components/Login_brand";
import LoginForm from "./components/Login_form";


const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

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
      alert("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0");
      return;
    }

    if (!formData.password) {
      alert("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser(
        formData.phone,
        formData.password
      );

      // ✅ Lưu token
      localStorage.setItem("token", result.access_token);

      // ✅ Chuyển trang sau login
      navigate("/customer");

    } catch (error) {
      if (error.response?.status === 401) {
        alert("Sai số điện thoại hoặc mật khẩu");
      } else {
        alert("Lỗi hệ thống, vui lòng thử lại");
      }
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
      />
    </main>
  );
};

export default Login;