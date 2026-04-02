import React from "react";
import styles from "./Splitter.module.css";

export default function Splitter({ onMouseDown }) {
  return (
    <div
      className={styles.splitter}
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
    />
  );
}