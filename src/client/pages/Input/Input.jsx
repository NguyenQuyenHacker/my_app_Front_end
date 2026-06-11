import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';

const Input = ({ id, label, type = 'text', ...props }) => {
  const isPassword = type === 'password';
  const [show, setShow] = useState(false);

  // Khi là password và đang "hiện" thì đổi type sang text để xem ký tự
  const inputType = isPassword && show ? 'text' : type;

  return (
    <div className={styles.field}>
      <input
        className={`${styles.input} ${isPassword ? styles.hasToggle : ''}`}
        id={id}
        type={inputType}
        placeholder=" " /* Cần có space để trigger css :placeholder-shown */
        {...props}
      />
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      {isPassword && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          title={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          tabIndex={-1}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

export default Input;
