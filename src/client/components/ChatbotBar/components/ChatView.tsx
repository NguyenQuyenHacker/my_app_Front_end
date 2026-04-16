/// <reference types="vite/client" />
import { useState, useMemo, FormEvent } from "react";
import { Client } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/react";
import type { BaseMessage } from "@langchain/core/messages";
import { AppMessage, CheckpointRef, MessageMeta } from "../core/types";
import { isVisibleMessage, getAccessToken } from "../core/utils";
import { AGENT_URL, ASSISTANT_ID } from "../core/constants";
import { MessageCard } from "./MessageCard";
import { ClockIcon, PlusIcon, SendIcon } from "./Icons";
import styles from "../ChatbotBar.module.css";

export function ChatView({
  threadId,
  onOpenHistory,
  onCreateNewThread,
  onClose,
}: {
  threadId: string;
  onOpenHistory: () => void;
  onCreateNewThread: () => Promise<void>;
  onClose?: () => void;
}) {
  const [prompt, setPrompt] = useState("");

  const stream = useStream({
    apiUrl: AGENT_URL,
    assistantId: ASSISTANT_ID,
    threadId,
    fetchStateHistory: true,
    client: new Client({
      apiUrl: AGENT_URL,
      defaultHeaders: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }),
  });

  const messages = useMemo(
    () => ((stream.messages ?? []) as BaseMessage[]).filter(isVisibleMessage),
    [stream.messages]
  );

  const submitUserMessage = async (
    text: string,
    checkpoint?: CheckpointRef | null
  ) => {
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

  const handleEdit = async (
    _message: BaseMessage,
    meta: MessageMeta | undefined,
    nextText: string
  ) => {
    const checkpoint = meta?.firstSeenState?.parent_checkpoint;
    if (!checkpoint) {
      alert("Không tìm thấy checkpoint để tạo branch.");
      return;
    }
    try {
      await submitUserMessage(nextText, checkpoint);
    } catch (error) {
      console.error(error);
      alert("Không thể sửa message và chạy lại.");
    }
  };

  const handleRegenerate = async (meta: MessageMeta | undefined) => {
    const checkpoint = meta?.firstSeenState?.parent_checkpoint;
    if (!checkpoint) {
      alert("Không tìm thấy checkpoint để regenerate.");
      return;
    }
    try {
      await stream.submit(undefined, { checkpoint: checkpoint as any });
    } catch (error) {
      console.error(error);
      alert("Không thể regenerate câu trả lời.");
    }
  };

  return (
    <div className={styles.chatPanel}>
      <header className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <span className={styles.statusDot} />
          <div>
            <h1 className={styles.title}>Chat với Agent</h1>
            <p className={styles.subtitle}>Techcombank AI Assistant</p>
          </div>
        </div>

        <div className={styles.chatHeaderRight}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onOpenHistory}
            title="Lịch sử chat"
            aria-label="Lịch sử chat"
          >
            <ClockIcon />
          </button>

          <button
            type="button"
            className={styles.iconButton}
            onClick={onCreateNewThread}
            title="Chat mới"
            aria-label="Chat mới"
          >
            <PlusIcon />
          </button>

          {onClose && (
            <button
              type="button"
              className={styles.headerCloseButton}
              onClick={onClose}
              title="Đóng chatbot"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <div className={styles.messages}>
        {messages.map((message, index) => (
          <MessageCard
            key={(message as AppMessage).id ?? `message-${index}`}
            message={message}
            index={index}
            meta={stream.getMessagesMetadata(message as any) as
              | MessageMeta
              | undefined}
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
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
              </div>
            </div>
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          value={prompt}
          disabled={stream.isLoading}
          className={styles.input}
          placeholder="Nhập câu hỏi của bạn..."
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={stream.isLoading || !prompt.trim()}
          title={stream.isLoading ? "Đang gửi..." : "Gửi"}
          aria-label={stream.isLoading ? "Đang gửi..." : "Gửi"}
        >
          {stream.isLoading ? (
            <span className={styles.sendLoadingText}>...</span>
          ) : (
            <SendIcon />
          )}
        </button>
      </form>
    </div>
  );
}
