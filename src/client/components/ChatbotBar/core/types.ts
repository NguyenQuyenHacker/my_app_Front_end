import type { BaseMessage } from "@langchain/core/messages";

export type ContentPart = string | { type?: string; text?: string };

export type AppMessage = BaseMessage & {
  id?: string;
  type?: "human" | "ai" | "tool" | string;
  role?: "user" | "assistant" | string;
  text?: string;
  content?: string | ContentPart[];
  tool_calls?: unknown[];
};

export type CheckpointRef = {
  checkpoint_id?: string;
  checkpoint_ns?: string;
};

export type MessageMeta = {
  branch?: string;
  branchOptions?: string[];
  firstSeenState?: { parent_checkpoint?: CheckpointRef | null };
};

export type UserThread = {
  id: string;
  user_id: string;
  thread_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

// Tin nhắn hội thoại bản Agents SDK (tuyến tính, không checkpoint/branch).
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ChatbotBarProps = {
  onClose?: () => void;
};
