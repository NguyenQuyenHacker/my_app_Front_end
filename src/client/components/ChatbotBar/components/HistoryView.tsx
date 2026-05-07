import { useState } from "react";
import { UserThread } from "../core/types";
import { getThreadPreviewTitle, formatThreadTime } from "../core/utils";
import { TrashIcon } from "./Icons";
import styles from "../ChatbotBar.module.css";

export function HistoryView({
  threads,
  activeThreadId,
  onSelectThread,
  onBackToChat,
  onCreateNewThread,
  onDeleteThread,
}: {
  threads: UserThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onBackToChat: () => void;
  onCreateNewThread: () => Promise<void>;
  onDeleteThread: (threadId: string) => void;
}) {
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  return (
    <div className={styles.historyPanel}>
      <div className={styles.historyHeader}>
        <div>
          <h2 className={styles.historyTitle}>Lịch sử chat</h2>
          <p className={styles.historySub}>Các cuộc trò chuyện của bạn</p>
        </div>

        <div className={styles.historyHeaderActions}>
          <button
            type="button"
            className={styles.historyNewButton}
            onClick={onCreateNewThread}
          >
            + Mới
          </button>
          <button
            type="button"
            className={styles.historyCloseButton}
            onClick={onBackToChat}
            title="Quay lại chat"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={styles.historyList}>
        {threads.length === 0 ? (
          <div className={styles.emptyThreads}>Chưa có cuộc trò chuyện nào</div>
        ) : (
          threads.map((thread) => {
            const active = activeThreadId === thread.thread_id;

            return (
              <div
                key={thread.id}
                className={`${styles.threadItem} ${
                  active ? styles.threadItemActive : ""
                }`}
                onClick={() => onSelectThread(thread.thread_id)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.threadItemContent}>
                  <div className={styles.threadItemTop}>
                    <span className={styles.threadDot} />
                    <span className={styles.threadTitle}>
                      {getThreadPreviewTitle(thread)}
                    </span>
                  </div>
                  <div className={styles.threadMeta}>
                    {formatThreadTime(thread.updated_at)}
                  </div>
                </div>

                <button 
                  type="button"
                  className={styles.threadDeleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setThreadToDelete(thread.thread_id);
                  }}
                  title="Xóa cuộc trò chuyện"
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })
        )}
      </div>

      {threadToDelete && (
        <div className={styles.modalOverlay} onClick={() => setThreadToDelete(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <TrashIcon />
            </div>
            <h3 className={styles.modalTitle}>Xóa đoạn chat?</h3>
            <p className={styles.modalDesc}>
              Bạn có chắc chắn muốn xóa cuộc trò chuyện này không? Hành động này không thể hoàn tác.
            </p>
            <div className={styles.modalActions}>
              <button 
                type="button" 
                className={styles.modalCancelBtn} 
                onClick={() => setThreadToDelete(null)}
              >
                Hủy
              </button>
              <button 
                type="button" 
                className={styles.modalConfirmBtn} 
                onClick={() => {
                  onDeleteThread(threadToDelete);
                  setThreadToDelete(null);
                }}
              >
                Xóa bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
