/// <reference types="vite/client" />
import { useState, useMemo, useEffect, useRef, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/react";
import type { BaseMessage } from "@langchain/core/messages";
import { AppMessage, CheckpointRef, MessageMeta } from "../core/types";
import { isVisibleMessage, getAccessToken } from "../core/utils";
import { AGENT_URL, ASSISTANT_ID } from "../core/constants";
import { MessageCard } from "./MessageCard";
import { HITLApprovalRenderer } from "./HITLApprovalRenderer";
import { ClockIcon, PlusIcon, SendIcon } from "./Icons";
import type { PendingTransfer } from "./TransferConfirmCard";
import { useT } from "../../../i18n/LanguageContext";
import styles from "../ChatbotBar.module.css";

const TRANSFER_PENDING_MARKER = "[TRANSFER_PENDING]";
const HANDLED_SESSIONS_STORAGE_KEY = "fe_handled_transfer_sessions";

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
    /* ignore */
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

export function ChatView({
  threadId,
  onOpenHistory,
  onCreateNewThread,
  onUpdateTitle,
  onClose,
}: {
  threadId: string;
  onOpenHistory: () => void;
  onCreateNewThread: () => Promise<void>;
  onUpdateTitle?: (threadId: string, title: string) => Promise<void>;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const t = useT();
  const [prompt, setPrompt] = useState("");
  const [handledSessions, setHandledSessions] = useState<Set<string>>(() =>
    loadHandledSessions()
  );
  const navigatedRef = useRef<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const max = 160; // px ~ 6-7 dòng
    const next = Math.min(ta.scrollHeight, max);
    ta.style.height = `${next}px`;
    // Chỉ hiện scrollbar khi đã đạt max height
    ta.style.overflowY = ta.scrollHeight > max ? "auto" : "hidden";
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  const stream = useStream<{ messages: BaseMessage[] }>({
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

  const isInterrupted = !!stream.interrupt;

  const pendingTransfer = useMemo<PendingTransfer | null>(() => {
    const found = extractPendingTransfer((stream.messages ?? []) as BaseMessage[]);
    if (!found || !found.session_id) return null;
    if (handledSessions.has(found.session_id)) return null;
    return found;
  }, [stream.messages, handledSessions]);

  // Auto-navigate sang TransferScreen khi detect pending transfer mới
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
      // Auto-title if it's the first message
      if (messages.length === 0 && onUpdateTitle) {
        const cleanText = text.replace(/[?.,!]+/g, "").trim();
        const newTitle =
          cleanText.length > 30 ? cleanText.substring(0, 30) + "..." : cleanText;
        onUpdateTitle(threadId, newTitle || t("chatbot.defaultThreadTitle"));
      }
      await submitUserMessage(text);
    } catch (error) {
      console.error(error);
      alert(t("chatbot.cannotSendMessage"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter (không shift) → submit | Shift+Enter → xuống dòng (default behavior)
    // isComposing: tránh submit khi đang gõ IME (tiếng Việt Telex/VNI)
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleEdit = async (
    _message: BaseMessage,
    meta: MessageMeta | undefined,
    nextText: string
  ) => {
    const checkpoint = meta?.firstSeenState?.parent_checkpoint;
    if (!checkpoint) {
      alert(t("chatbot.noCheckpointBranch"));
      return;
    }
    try {
      await submitUserMessage(nextText, checkpoint);
    } catch (error) {
      console.error(error);
      alert(t("chatbot.cannotEditMessage"));
    }
  };

  const handleRegenerate = async (meta: MessageMeta | undefined) => {
    const checkpoint = meta?.firstSeenState?.parent_checkpoint;
    if (!checkpoint) {
      alert(t("chatbot.noCheckpointRegen"));
      return;
    }
    try {
      await stream.submit(undefined, { checkpoint: checkpoint as any });
    } catch (error) {
      console.error(error);
      alert(t("chatbot.cannotRegenerate"));
    }
  };

  return (
    <div className={styles.chatPanel}>
      <header className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <span className={styles.statusDot} />
          <div>
            <h1 className={styles.title}>{t("chatbot.title")}</h1>
            <p className={styles.subtitle}>{t("chatbot.subtitle")}</p>
          </div>
        </div>

        <div className={styles.chatHeaderRight}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onOpenHistory}
            title={t("chatbot.historyTooltip")}
            aria-label={t("chatbot.historyTooltip")}
          >
            <ClockIcon />
          </button>

          <button
            type="button"
            className={styles.iconButton}
            onClick={onCreateNewThread}
            title={t("chatbot.newChatTooltip")}
            aria-label={t("chatbot.newChatTooltip")}
          >
            <PlusIcon />
          </button>

          {onClose && (
            <button
              type="button"
              className={styles.headerCloseButton}
              onClick={onClose}
              title={t("chatbot.closeTooltip")}
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

        <HITLApprovalRenderer
          interrupt={stream.interrupt}
          submit={stream.submit}
          isProcessing={stream.isLoading}
        />

        {stream.isLoading && !isInterrupted && (
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
        <textarea
          ref={textareaRef}
          value={prompt}
          disabled={stream.isLoading || isInterrupted}
          className={styles.input}
          placeholder={
            isInterrupted
              ? t("chatbot.inputPlaceholderInterrupted")
              : t("chatbot.inputPlaceholder")
          }
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={stream.isLoading || isInterrupted || !prompt.trim()}
          title={stream.isLoading ? t("chatbot.sending") : t("chatbot.send")}
          aria-label={stream.isLoading ? t("chatbot.sending") : t("chatbot.send")}
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
