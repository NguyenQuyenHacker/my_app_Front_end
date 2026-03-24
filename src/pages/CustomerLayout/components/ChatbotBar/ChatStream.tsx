import { FormEvent, useMemo, useState } from "react";
import { useStream } from "@langchain/react";
import type { BaseMessage } from "@langchain/core/messages";
import { AGENT_URL, ASSISTANT_ID, THREAD_STORAGE_KEY } from "./core/constants";
import { createThread } from "./core/api";
import { isVisibleMessage } from "./core/utils";
import type { AppMessage, MessageMeta, CheckpointRef } from "./core/types";
import { MessageCard } from "./components/MessageCard";
import styles from "./ChatbotBar.module.css";

export function ChatStream({ threadId, onCreateNewThread }: { threadId: string; onCreateNewThread: (id: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const stream = useStream({ apiUrl: AGENT_URL, assistantId: ASSISTANT_ID, threadId, fetchStateHistory: true });

  const messages = useMemo(() => ((stream.messages ?? []) as BaseMessage[]).filter(isVisibleMessage), [stream.messages]);

  const submitUserMessage = async (text: string, checkpoint?: CheckpointRef | null) => {
    await stream.submit(
      { messages: [{ role: "user", content: text }] as any },
      checkpoint ? { checkpoint: checkpoint as any } : undefined
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || stream.isLoading) return;
    setPrompt("");
    try {
      await submitUserMessage(text);
    } catch (error) {
      console.error(error);
      alert("Không gửi được tin nhắn.");
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const newThreadId = await createThread();
      localStorage.setItem(THREAD_STORAGE_KEY, newThreadId);
      onCreateNewThread(newThreadId);
    } catch (error) {
      console.error(error);
      alert("Không thể tạo chat mới.");
    }
  };

  const handleEdit = async (_message: BaseMessage, meta: MessageMeta | undefined, nextText: string) => {
    const checkpoint = meta?.firstSeenState?.parent_checkpoint;
    if (!checkpoint) return alert("Không tìm thấy checkpoint để tạo branch.");
    try {
      await submitUserMessage(nextText, checkpoint);
    } catch (error) {
      console.error(error);
      alert("Không thể sửa message và chạy lại.");
    }
  };

  const handleRegenerate = async (meta: MessageMeta | undefined) => {
    const checkpoint = meta?.firstSeenState?.parent_checkpoint;
    if (!checkpoint) return alert("Không tìm thấy checkpoint để regenerate.");
    try {
      await stream.submit(undefined, { checkpoint: checkpoint as any });
    } catch (error) {
      console.error(error);
      alert("Không thể regenerate câu trả lời.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.chatCard}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Chat với Agent</h1>
            <p className={styles.subtitle}>Techcombank AI Assistant</p>
          </div>
          <button type="button" className={styles.newChatButton} onClick={handleCreateNewChat}>Chat mới</button>
        </header>

        <div className={styles.threadInfo}>Thread ID: {threadId}</div>

        <div className={styles.messages}>
          {messages.map((message, index) => (
            <MessageCard
              key={(message as AppMessage).id ?? `message-${index}`}
              message={message}
              index={index}
              meta={stream.getMessagesMetadata(message as any) as MessageMeta | undefined}
              loading={stream.isLoading}
              onEdit={handleEdit}
              onRegenerate={handleRegenerate}
              onSwitchBranch={stream.setBranch}
            />
          ))}

          {stream.isLoading && (
            <div className={`${styles.messageRow} ${styles.aiRow}`}>
              <div className={`${styles.messageBubble} ${styles.aiBubble}`}>
                <div className={styles.typing}>
                  <span className={styles.typingDot} /><span className={styles.typingDot} /><span className={styles.typingDot} />
                </div>
              </div>
            </div>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input value={prompt} disabled={stream.isLoading} className={styles.input} placeholder="Nhập câu hỏi của bạn..." onChange={(e) => setPrompt(e.target.value)} />
          <button type="submit" className={styles.sendButton} disabled={stream.isLoading || !prompt.trim()}>
            {stream.isLoading ? "Đang gửi..." : "Gửi"}
          </button>
        </form>
      </div>
    </div>
  );
}
