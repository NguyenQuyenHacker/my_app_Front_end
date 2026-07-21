/// <reference types="vite/client" />
import { useState, useMemo, useEffect, useRef, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mic } from "lucide-react";
import { fetchQuota } from "../core/api";
import { useAgentChat } from "../core/useAgentChat";
import { MessageCard } from "./MessageCard";
import { ClockIcon, PlusIcon, SendIcon } from "./Icons";
import type { PendingTransfer } from "./TransferConfirmCard";
import { useT, useLanguage } from "../../../i18n/LanguageContext";
import { useSpeechRecognition } from "../core/useSpeechRecognition";
import styles from "../ChatbotBar.module.css";

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
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [handledSessions, setHandledSessions] = useState<Set<string>>(() =>
    loadHandledSessions()
  );
  const navigatedRef = useRef<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Chat qua WebSocket (thay useStream)
  const {
    messages,
    isLoading,
    connected,
    send,
    pendingTransfer: wsTransfer,
    clearPendingTransfer,
  } = useAgentChat(threadId);

  // Hạn mức token/ngày (BE /chat/quota — hiển thị)
  const { data: quota } = useQuery({
    queryKey: ["chatQuota"],
    queryFn: fetchQuota,
    staleTime: 30_000,
  });
  const quotaExceeded = !!quota?.is_exceeded;

  // Voice-to-text
  const baseTextRef = useRef("");
  const { isListening, supported: speechSupported, start, stop } =
    useSpeechRecognition(language === "en" ? "en-US" : "vi-VN", (transcript) => {
      const base = baseTextRef.current;
      setPrompt((base ? base + " " : "") + transcript);
    });

  const handleMicToggle = () => {
    if (isListening) {
      stop();
    } else {
      baseTextRef.current = prompt.trim();
      start();
    }
  };

  const adjustTextareaHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const max = 160;
    const next = Math.min(ta.scrollHeight, max);
    ta.style.height = `${next}px`;
    ta.style.overflowY = ta.scrollHeight > max ? "auto" : "hidden";
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  // Tự cuộn xuống tin nhắn mới nhất khi gửi/nhận (kể cả lúc đang stream token) + hiện typing.
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  // Sau khi 1 lượt xong → refetch quota
  const prevLoadingRef = useRef(false);
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading) {
      const id = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["chatQuota"] });
      }, 1200);
      return () => clearTimeout(id);
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, queryClient]);

  // Payload chuyển khoản do serving đẩy qua WS (event "transfer") → navigate sang trang chuyển khoản
  const pendingTransfer = useMemo<PendingTransfer | null>(() => {
    if (!wsTransfer || !wsTransfer.session_id) return null;
    if (handledSessions.has(wsTransfer.session_id)) return null;
    return wsTransfer as PendingTransfer;
  }, [wsTransfer, handledSessions]);

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
    clearPendingTransfer();
  }, [pendingTransfer, navigate, clearPendingTransfer]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || isLoading || quotaExceeded || !connected) return;

    // Auto-title khi là tin nhắn đầu
    if (messages.length === 0 && onUpdateTitle) {
      const cleanText = text.replace(/[?.,!]+/g, "").trim();
      const newTitle =
        cleanText.length > 30 ? cleanText.substring(0, 30) + "..." : cleanText;
      onUpdateTitle(threadId, newTitle || t("chatbot.defaultThreadTitle"));
    }

    const ok = send(text);
    if (ok) setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  // Tin hiển thị: bỏ placeholder assistant rỗng (đang chờ token đầu)
  const visibleMessages = messages.filter(
    (m) => !(m.role === "assistant" && m.content === "")
  );
  const last = messages[messages.length - 1];
  const showTyping =
    isLoading && last?.role === "assistant" && last.content === "";

  const inputDisabled = isLoading || quotaExceeded || !connected;

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
          {quota && (
            <span
              className={`${styles.quotaChip} ${
                quotaExceeded ? styles.quotaChipExceeded : ""
              }`}
              title={`Token hôm nay: ${quota.used.toLocaleString(
                "vi-VN"
              )} / ${quota.limit.toLocaleString("vi-VN")}`}
            >
              <span className={styles.quotaDot} />
              {quota.used.toLocaleString("vi-VN")} / {Math.round(quota.limit / 1000)}k
            </span>
          )}

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

      <div className={styles.messages} ref={messagesRef}>
        {visibleMessages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}

        {showTyping && (
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
          disabled={inputDisabled}
          className={styles.input}
          placeholder={
            !connected
              ? "Đang kết nối..."
              : quotaExceeded
              ? t("chatbot.quotaExceeded")
              : isListening
              ? t("chatbot.listening")
              : t("chatbot.inputPlaceholder")
          }
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <div className={styles.formActions}>
          {speechSupported && (
            <button
              type="button"
              className={`${styles.micButton} ${
                isListening ? styles.micButtonActive : ""
              }`}
              onClick={handleMicToggle}
              disabled={inputDisabled}
              title={isListening ? t("chatbot.micStop") : t("chatbot.micStart")}
              aria-label={isListening ? t("chatbot.micStop") : t("chatbot.micStart")}
            >
              <Mic size={18} />
            </button>
          )}
          <button
            type="submit"
            className={styles.sendButton}
            disabled={inputDisabled || !prompt.trim()}
            title={isLoading ? t("chatbot.sending") : t("chatbot.send")}
            aria-label={isLoading ? t("chatbot.sending") : t("chatbot.send")}
          >
            {isLoading ? (
              <span className={styles.sendLoadingText}>...</span>
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
