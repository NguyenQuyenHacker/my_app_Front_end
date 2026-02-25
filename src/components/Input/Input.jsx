import React from 'react';
import styles from './Input.module.css';

const Input = ({ id, label, type = 'text', ...props }) => {
  return (
    <div className={styles.field}>
      <input
        className={styles.input}
        id={id}
        type={type}
        placeholder=" " /* Cần có space để trigger css :placeholder-shown */
        {...props}
      />
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default Input;