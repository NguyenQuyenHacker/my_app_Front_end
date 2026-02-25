import React from "react";
import styles from "./ChatbotBar.module.css";

export default function ChatbotBar({ onClose }) {
  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.statusWrap}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>AI Chatbot</span>
        </div>

        <div className={styles.topActions}>
          <button className={styles.iconButton} type="button">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
          <button className={styles.iconButton} onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className={styles.chatContent}>
        <div className={styles.greetingBox}>
          <div className={styles.botBadge}>
            <span className="material-symbols-outlined">smart_toy</span>
          </div>
          <h2 className={styles.greetingTitle}>Xin chào, Quyền</h2>
          <p className={styles.greetingDesc}>Tôi có thể giúp gì cho bạn hôm nay?</p>
        </div>

        <div className={styles.suggestionList}>
          <button className={styles.suggestionButton}>
            <div className={styles.suggestionRow}>
              <span className={`material-symbols-outlined ${styles.redIcon}`}>
                summarize
              </span>
              <div>
                <span className={styles.suggestionTitle}>Tổng hợp thông tin</span>
                <span className={styles.suggestionDesc}>
                  Tóm tắt dữ liệu từ các tab đang mở
                </span>
              </div>
            </div>
          </button>

          <button className={styles.suggestionButton}>
            <div className={styles.suggestionRow}>
              <span className={`material-symbols-outlined ${styles.blueIcon}`}>
                analytics
              </span>
              <div>
                <span className={styles.suggestionTitle}>Phân tích giao dịch</span>
                <span className={styles.suggestionDesc}>
                  Kiểm tra lịch sử giao dịch gần đây
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className={styles.composerWrap}>
        <div className={styles.composerInner}>
          <textarea
            className={styles.textarea}
            placeholder="Nhập câu hỏi hoặc yêu cầu..."
            rows={1}
          />

          <div className={styles.composerBottom}>
            <div className={styles.leftTools}>
              <button className={styles.toolButton} title="Đính kèm">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <button className={styles.toolButton} title="Microphone">
                <span className="material-symbols-outlined">mic</span>
              </button>
            </div>

            <button className={styles.sendButton}>
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}