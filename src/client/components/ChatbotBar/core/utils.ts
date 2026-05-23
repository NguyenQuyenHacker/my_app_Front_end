import { AppMessage, UserThread } from "./types";
import type { BaseMessage } from "@langchain/core/messages";
import { ACCESS_TOKEN_KEY } from "./constants";

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getMessageText = (msg: Partial<AppMessage>): string => {
  if (typeof msg.text === "string") return msg.text;
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content
      .map((part) => (typeof part === "string" ? part : part?.text ?? ""))
      .join("");
  }
  return "";
};

export const getMessageKind = (
  msg: Partial<AppMessage>
): "human" | "ai" | "tool" | "" => {
  if (["human", "ai", "tool"].includes(msg.type ?? "")) {
    return msg.type as "human" | "ai" | "tool";
  }
  return msg.role === "user" ? "human" : msg.role === "assistant" ? "ai" : "";
};

export const getToolCalls = (msg: Partial<AppMessage>): unknown[] =>
  Array.isArray(msg.tool_calls) ? msg.tool_calls : [];

export const isVisibleMessage = (msg: BaseMessage): boolean => {
  const message = msg as AppMessage;

  if (message.additional_kwargs?.lc_source === "summarization") {
    return false;
  }

  const kind = getMessageKind(message);
  const text = getMessageText(message).trim();
  const toolCalls = getToolCalls(message);

  if (kind === "tool") {
    return false;
  }

  // Ẩn AI message "internal" (chỉ gọi tool, không có text cho user)
  if (kind === "ai" && !text && toolCalls.length > 0) {
    return false;
  }

  return kind === "human" || kind === "ai";
};

export function formatThreadTime(value: string): string {
  try {
    return new Date(value).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return value;
  }
}

export function getThreadPreviewTitle(thread: UserThread): string {
  const title = (thread.title || "").trim();
  return title || "Cuộc trò chuyện mới";
}
