import { useEffect, useState } from "react";
import { UserThread, ChatbotBarProps } from "./core/types";
import {
  fetchMyThreads,
  createLangGraphThread,
  saveUserThreadMapping,
} from "./core/api";
import { HistoryView } from "./components/HistoryView";
import { ChatView } from "./components/ChatView";
import styles from "./ChatbotBar.module.css";

export default function ChatbotBar({ onClose }: ChatbotBarProps) {
  const [threads, setThreads] = useState<UserThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const loadThreads = async () => {
    const data = await fetchMyThreads();
    setThreads(data);
    if (data.length > 0) {
      setActiveThreadId((prev) => prev ?? data[0].thread_id);
    } else {
      setActiveThreadId(null);
    }
  };

  const handleCreateNewThread = async () => {
    try {
      const langgraphThreadId = await createLangGraphThread();
      const saved = await saveUserThreadMapping(langgraphThreadId);
      setThreads((prev) => [saved, ...prev]);
      setActiveThreadId(saved.thread_id);
      setShowHistory(false);
    } catch (error) {
      console.error(error);
      alert("Không thể tạo chat mới.");
    }
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setShowHistory(false);
  };

  useEffect(() => {
    let mounted = true;
    setStatus("loading");

    loadThreads()
      .then(() => {
        if (!mounted) return;
        setStatus("success");
      })
      .catch((err) => {
        if (!mounted) return;
        console.error(err);
        setErrorMsg(
          err instanceof Error ? err.message : "Không tải được danh sách thread"
        );
        setStatus("error");
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading") {
    return <div className={styles.centerState}>Đang tải lịch sử chat...</div>;
  }

  if (status === "error") {
    return <div className={styles.centerError}>Lỗi: {errorMsg}</div>;
  }

  return (
    <div className={styles.wrapper}>
      {showHistory ? (
        <HistoryView
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectThread}
          onBackToChat={() => setShowHistory(false)}
          onCreateNewThread={handleCreateNewThread}
        />
      ) : activeThreadId ? (
        <ChatView
          threadId={activeThreadId}
          onOpenHistory={() => setShowHistory(true)}
          onCreateNewThread={handleCreateNewThread}
          onClose={onClose}
        />
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateCard}>
            <h3>Chưa có cuộc trò chuyện nào</h3>
            <p>Bắt đầu một cuộc trò chuyện mới với trợ lý AI.</p>
            <button
              type="button"
              className={styles.historyNewButton}
              onClick={handleCreateNewThread}
            >
              Tạo chat đầu tiên
            </button>
          </div>
        </div>
      )}
    </div>
  );
}