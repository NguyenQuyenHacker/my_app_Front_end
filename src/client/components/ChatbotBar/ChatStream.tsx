// /src/client/components/ChatbotBar/ChatStream.tsx
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStream } from "@langchain/react";
import type { BaseMessage } from "@langchain/core/messages";
import { Client } from "@langchain/langgraph-sdk";
import { AGENT_URL, ASSISTANT_ID } from "./core/constants";
import { createNewThread } from "./core/api";

const THREAD_STORAGE_KEY = "chat_thread_id";
const TRANSFER_PENDING_MARKER = "[TRANSFER_PENDING]";
const HANDLED_SESSIONS_STORAGE_KEY = "fe_handled_transfer_sessions";

import { isVisibleMessage } from "./core/utils";
import type { AppMessage, MessageMeta, CheckpointRef } from "./core/types";
import { MessageCard } from "./components/MessageCard";
import type { PendingTransfer } from "./components/TransferConfirmCard";
import styles from "./ChatbotBar.module.css";

function loadHandledSessions(): Set<string> {
  try {
    const raw = localStorage.getItem(HANDLED_SESSIONS_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistHandledSessions(set: Set<string>) {
  try {
    localStorage.setItem(HANDLED_SESSIONS_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore quota errors */
  }
}

function messageContentToString(m: any): string {
  const c = m?.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) {
    return c
      .map((part: any) => (typeof part === "string" ? part : part?.text ?? ""))
      .join("");
  }
  return "";
}

function extractPendingTransfer(messages: BaseMessage[]): PendingTransfer | null {
  if (!messages?.length) return null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const content = messageContentToString(messages[i]);
    const idx = content.indexOf(TRANSFER_PENDING_MARKER);
    if (idx < 0) continue;

    const after = content.slice(idx + TRANSFER_PENDING_MARKER.length);
    const endIdx = after.indexOf("\n");
    const jsonStr = (endIdx >= 0 ? after.slice(0, endIdx) : after).trim();

    try {
      const parsed = JSON.parse(jsonStr) as PendingTransfer;
      if (parsed?.session_id) return parsed;
    } catch {
      continue;
    }
  }
  return null;
}

export function ChatStream({
  threadId,
  onCreateNewThread,
}: {
  threadId: string;
  onCreateNewThread: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [handledSessions, setHandledSessions] = useState<Set<string>>(() =>
    loadHandledSessions()
  );
  const navigatedRef = useRef<Set<string>>(new Set());

  const {
    messages: streamMessages,
    isLoading,
    submit,
    setBranch,
    getMessagesMetadata,
  } = useStream({
    apiUrl: AGENT_URL,
    assistantId: ASSISTANT_ID,
    threadId,
    fetchStateHistory: true,
    client: new Client({
      apiUrl: AGENT_URL,
      defaultHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }),
  });

  const messages = useMemo(
    () => ((streamMessages ?? []) as BaseMessage[]).filter(isVisibleMessage),
    [streamMessages]
  );

  const pendingTransfer = useMemo<PendingTransfer | null>(() => {
    const found = extractPendingTransfer((streamMessages ?? []) as BaseMessage[]);
    if (!found || !found.session_id) return null;
    if (handledSessions.has(found.session_id)) return null;
    return found;
  }, [streamMessages, handledSessions]);

  // Khi detect pending transfer mới → navigate sang TransferScreen với data pre-fill
  useEffect(() => {
    if (!pendingTransfer) return;
    const sid = pendingTransfer.session_id;
    if (navigatedRef.current.has(sid)) return;
    navigatedRef.current.add(sid);

    setHandledSessions((prev) => {
      const next = new Set(prev);
      next.add(sid);
      persistHandledSessions(next);
      return next;
    });

    navigate("/customer/transfer", { state: { fromAgent: pendingTransfer } });
  }, [pendingTransfer, navigate]);

  const submitUserMessage = async (text: string, checkpoint?: CheckpointRef | null) => {
    await submit(
      { messages: [{ role: "user", content: text }] as any },
      checkpoint ? { checkpoint: checkpoint as any } : undefined
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || isLoading) return;
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
      const savedThread = await createNewThread();
      const newThreadId = savedThread.thread_id;
      localStorage.setItem(THREAD_STORAGE_KEY, newThreadId);
      onCreateNewThread(newThreadId);
    } catch (error) {
      console.error(error);
      alert("Không thể tạo chat mới.");
    }
  };

  const handleEdit = async (
    _message: BaseMessage,
    meta: MessageMeta | undefined,
    nextText: string
  ) => {
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
      await submit(undefined, { checkpoint: checkpoint as any });
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
          <button type="button" className={styles.newChatButton} onClick={handleCreateNewChat}>
            Chat mới
          </button>
        </header>

        <div className={styles.threadInfo}>Thread ID: {threadId}</div>

        <div className={styles.messages}>
          {messages.map((message, index) => (
            <MessageCard
              key={(message as AppMessage).id ?? `message-${index}`}
              message={message}
              index={index}
              meta={getMessagesMetadata(message as any) as MessageMeta | undefined}
              loading={isLoading}
              onEdit={handleEdit}
              onRegenerate={handleRegenerate}
              onSwitchBranch={setBranch}
            />
          ))}

          {isLoading && (
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
            disabled={isLoading}
            className={styles.input}
            placeholder="Nhập câu hỏi của bạn..."
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? "Đang gửi..." : "Gửi"}
          </button>
        </form>
      </div>
    </div>
  );
}
