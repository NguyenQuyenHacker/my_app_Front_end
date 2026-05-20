import React, { useState, useEffect } from "react";
import styles from "./BankLogo.module.css";

const BankLogo = ({ bank, size = 48 }) => {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [bank?.logo]);

  const style = { width: size, height: size };

  if (bank?.logo && !errored) {
    return (
      <img
        src={bank.logo}
        alt={bank.short || bank.code || ""}
        className={styles.image}
        style={style}
        onError={() => setErrored(true)}
      />
    );
  }

  const initial = bank?.code?.[0] || "?";
  return (
    <div
      className={styles.fallback}
      style={{
        ...style,
        background: bank?.color || "#9CA3AF",
        fontSize: size * 0.4,
      }}
    >
      {initial}
    </div>
  );
};

export default BankLogo;
