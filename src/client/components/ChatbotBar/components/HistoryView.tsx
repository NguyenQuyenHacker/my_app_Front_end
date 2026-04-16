import { UserThread } from "../core/types";
import { getThreadPreviewTitle, formatThreadTime } from "../core/utils";
import styles from "../ChatbotBar.module.css";

export function HistoryView({
  threads,
  activeThreadId,
  onSelectThread,
  onBackToChat,
  onCreateNewThread,
}: {
  threads: UserThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onBackToChat: () => void;
  onCreateNewThread: () => Promise<void>;
}) {
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
              <button
                key={thread.id}
                type="button"
                className={`${styles.threadItem} ${
                  active ? styles.threadItemActive : ""
                }`}
                onClick={() => onSelectThread(thread.thread_id)}
              >
                <div className={styles.threadItemTop}>
                  <span className={styles.threadDot} />
                  <span className={styles.threadTitle}>
                    {getThreadPreviewTitle(thread)}
                  </span>
                </div>
                <div className={styles.threadMeta}>
                  {formatThreadTime(thread.updated_at)}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
