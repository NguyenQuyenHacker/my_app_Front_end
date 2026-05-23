import { useState, useEffect } from "react";
import type { BaseMessage } from "@langchain/core/messages";
import { AppMessage, MessageMeta } from "../core/types";
import { getMessageText, getMessageKind } from "../core/utils";
import { BranchSwitcher } from "./BranchSwitcher";
import { MarkdownText } from "./MarkdownText";
import { useT } from "../../../i18n/LanguageContext";
import styles from "../ChatbotBar.module.css";

export type MessageCardProps = {
  message: BaseMessage;
  index: number;
  meta?: MessageMeta;
  loading: boolean;
  onEdit: (
    message: BaseMessage,
    meta: MessageMeta | undefined,
    nextText: string
  ) => Promise<void>;
  onRegenerate: (meta: MessageMeta | undefined) => Promise<void>;
  onSwitchBranch: (branchId: string) => void;
};

export function MessageCard({
  message,
  index,
  meta,
  loading,
  onEdit,
  onRegenerate,
  onSwitchBranch,
}: MessageCardProps) {
  const t = useT();
  const appMessage = message as AppMessage;
  const text = getMessageText(appMessage);
  const kind = getMessageKind(appMessage);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  const handleSave = async () => {
    const nextText = draft.trim();
    if (!nextText || loading) return;
    await onEdit(message, meta, nextText);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(text);
    setEditing(false);
  };

  const messageId = appMessage.id ?? `message-${index}`;

  if (kind === "human") {
    return (
      <div key={messageId} className={`${styles.messageRow} ${styles.humanRow}`}>
        <div
          className={`${styles.messageBlock} ${styles.humanBlock} ${
            editing ? styles.messageBlockEditing : ""
          }`}
        >
          {editing ? (
            <div
              className={`${styles.messageBubble} ${styles.humanBubble} ${styles.messageBubbleEditing}`}
            >
              <textarea
                rows={4}
                value={draft}
                disabled={loading}
                className={styles.editTextarea}
                onChange={(e) => setDraft(e.target.value)}
              />
              <div
                className={`${styles.messageActions} ${styles.messageActionsEdit}`}
              >
                <BranchSwitcher
                  meta={meta}
                  disabled={loading}
                  onSwitch={onSwitchBranch}
                />
                <button
                  type="button"
                  className={styles.secondaryAction}
                  disabled={loading}
                  onClick={handleCancel}
                >
                  {t("chatbot.cancel")}
                </button>
                <button
                  type="button"
                  className={styles.primaryAction}
                  disabled={loading || !draft.trim()}
                  onClick={handleSave}
                >
                  {t("chatbot.saveAndRerun")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`${styles.messageBubble} ${styles.humanBubble}`}>
                {text}
              </div>
              <div className={styles.messageActions}>
                <button
                  type="button"
                  className={styles.ghostAction}
                  disabled={loading}
                  onClick={() => setEditing(true)}
                >
                  {t("chatbot.edit")}
                </button>
                <BranchSwitcher
                  meta={meta}
                  disabled={loading}
                  onSwitch={onSwitchBranch}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (kind === "ai") {
    return (
      <div key={messageId} className={`${styles.messageRow} ${styles.aiRow}`}>
        <div className={`${styles.messageBlock} ${styles.aiBlock}`}>
          <div className={`${styles.messageBubble} ${styles.aiBubble}`}>
            <MarkdownText>{text}</MarkdownText>
          </div>
          <div className={styles.messageActions}>
            <button
              type="button"
              className={styles.ghostAction}
              disabled={loading}
              onClick={() => onRegenerate(meta)}
            >
              {t("chatbot.regenerate")}
            </button>
            <BranchSwitcher
              meta={meta}
              disabled={loading}
              onSwitch={onSwitchBranch}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
