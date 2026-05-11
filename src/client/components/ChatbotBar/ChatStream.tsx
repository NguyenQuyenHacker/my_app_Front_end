// /src/client/components/ChatbotBar/ChatStream.tsx - Updated at 2026-05-11 16:05
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useStream } from "@langchain/react";
import type { BaseMessage } from "@langchain/core/messages";
import { Client } from "@langchain/langgraph-sdk";
import { AGENT_URL, ASSISTANT_ID } from "./core/constants";
import { createNewThread } from "./core/api";

const THREAD_STORAGE_KEY = "chat_thread_id";
import { isVisibleMessage } from "./core/utils";
import type { AppMessage, MessageMeta, CheckpointRef } from "./core/types";
import { MessageCard } from "./components/MessageCard";
import { HITLApprovalRenderer } from "./components/HITLApprovalRenderer";
import styles from "./ChatbotBar.module.css";

export function ChatStream({ threadId, onCreateNewThread }: { threadId: string; onCreateNewThread: (id: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const { messages: streamMessages, isLoading, submit, setBranch, getMessagesMetadata, interrupt } = useStream({
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

  const messages = useMemo(() => ((streamMessages ?? []) as BaseMessage[]).filter(isVisibleMessage), [streamMessages]);
  
  // Radar theo dõi interrupt - Nếu biến này thay đổi, chúng ta sẽ biết ngay
  useEffect(() => {
    if (interrupt) {
      console.log("🎯 RADAR: Interrupt detected!", interrupt);
    }
  }, [interrupt]);

  // Logic trích xuất interrupt an toàn nhất có thể
  const activeInterrupt = useMemo(() => {
    if (!interrupt) return null;
    
    // Trường hợp 1: Là JavaScript Map thực thụ (SDK mới)
    if (interrupt instanceof Map && interrupt.size > 0) {
      const firstValue = Array.from(interrupt.values())[0];
      return Array.isArray(firstValue) ? firstValue[0] : firstValue;
    }

    // Trường hợp 2: Là mảng
    if (Array.isArray(interrupt) && interrupt.length > 0) return interrupt[0];
    
    // Trường hợp 3: Là object có value trực tiếp
    if (typeof interrupt === "object" && (interrupt as any).value) return interrupt;
    
    // Trường hợp 4: Là Map dạng Object (JSON của bạn)
    const keys = Object.keys(interrupt);
    if (keys.length > 0) {
      const first = (interrupt as any)[keys[0]];
      return Array.isArray(first) ? first[0] : first;
    }
    
    return null;
  }, [interrupt]);

  // Trích xuất dữ liệu yêu cầu từ interrupt
  const actionRequest = useMemo(() => {
    if (!activeInterrupt?.value) return null;
    const val = activeInterrupt.value as any;
    // Hỗ trợ cả snake_case và camelCase
    const reqs = val.action_requests || val.actionRequests;
    return Array.isArray(reqs) ? reqs[0] : null;
  }, [activeInterrupt]);

  const reviewConfig = useMemo(() => {
    if (!activeInterrupt?.value) return null;
    const val = activeInterrupt.value as any;
    const configs = val.review_configs || val.reviewConfigs;
    return Array.isArray(configs) ? configs[0] : null;
  }, [activeInterrupt]);

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
          <button type="button" className={styles.newChatButton} onClick={handleCreateNewChat}>Chat mới</button>
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

          <HITLApprovalRenderer
            interrupt={interrupt}
            submit={submit}
            isProcessing={isLoading}
          />

          {isLoading && !actionRequest && (
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
          <input value={prompt} disabled={isLoading} className={styles.input} placeholder="Nhập câu hỏi của bạn..." onChange={(e) => setPrompt(e.target.value)} />
          <button type="submit" className={styles.sendButton} disabled={isLoading || !prompt.trim()}>
            {isLoading ? "Đang gửi..." : "Gửi"}
          </button>
        </form>
      </div>
    </div>
  );
}