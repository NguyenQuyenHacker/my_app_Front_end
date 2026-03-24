import { useEffect, useState } from "react";
import { getStoredOrCreateThread } from "./core/api";
import { ChatStream } from "./ChatStream";
import styles from "./ChatbotBar.module.css";

export default function ChatbotBar() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    setStatus("loading");

    getStoredOrCreateThread()
      .then((id) => {
        if (!mounted) return;
        setThreadId(id);
        setStatus("success");
      })
      .catch((err) => {
        if (!mounted) return;
        console.error(err);
        setErrorMsg(err instanceof Error ? err.message : "Lỗi khởi tạo thread");
        setStatus("error");
      });

    return () => { mounted = false; };
  }, []);

  if (status === "loading") return <div className={styles.status}>Đang khởi tạo thread...</div>;
  if (status === "error" || !threadId) return <div className={styles.error}>Lỗi: {errorMsg || "Không có threadId"}</div>;

  return (
    <ChatStream
      threadId={threadId}
      onCreateNewThread={(nextId) => {
        setThreadId(nextId);
        setStatus("success");
        setErrorMsg("");
      }}
    />
  );
}