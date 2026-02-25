import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', type = 'button', onClick }) => {
  // variant: 'primary' | 'secondary'
  return (
    <button 
      className={`${styles.btn} ${styles[variant]}`} 
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;