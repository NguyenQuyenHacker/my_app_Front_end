import { MarkdownText } from "./MarkdownText";
import type { ChatMessage } from "../core/types";
import styles from "../ChatbotBar.module.css";

// Hội thoại tuyến tính: chỉ render bong bóng user/assistant, không edit/regenerate/branch.
export type MessageCardProps = {
  message: ChatMessage;
};

export function MessageCard({ message }: MessageCardProps) {
  const { role, content } = message;

  if (role === "user") {
    return (
      <div className={`${styles.messageRow} ${styles.humanRow}`}>
        <div className={`${styles.messageBlock} ${styles.humanBlock}`}>
          <div className={`${styles.messageBubble} ${styles.humanBubble}`}>{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.messageRow} ${styles.aiRow}`}>
      <div className={`${styles.messageBlock} ${styles.aiBlock}`}>
        <div className={`${styles.messageBubble} ${styles.aiBubble}`}>
          <MarkdownText>{content}</MarkdownText>
        </div>
      </div>
    </div>
  );
}
