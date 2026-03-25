import styles from "../ChatbotBar.module.css";

export function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.8v4.7l3 1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
      <path
        d="M3.8 11.6L19.4 4.6c.8-.4 1.6.4 1.2 1.2l-7 15.6c-.4.9-1.7.8-1.9-.1l-1.3-5.2-5.2-1.3c-.9-.2-1-.5-1.4-.5.2-1.1-.4-1.7.0-2.7Z"
        fill="currentColor"
      />
      <path
        d="M10.4 15.9l9-9"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
