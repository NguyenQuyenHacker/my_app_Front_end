import type { BaseMessage } from "@langchain/core/messages";
import type { AppMessage } from "./types";

export const getMessageText = (msg: Partial<AppMessage>): string => {
  if (typeof msg.text === "string") return msg.text;
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content.map(part => (typeof part === "string" ? part : part?.text ?? "")).join("");
  }
  return "";
};

export const getMessageKind = (msg: Partial<AppMessage>): "human" | "ai" | "tool" | "" => {
  if (["human", "ai", "tool"].includes(msg.type ?? "")) return msg.type as "human" | "ai" | "tool";
  return msg.role === "user" ? "human" : msg.role === "assistant" ? "ai" : "";
};

export const getToolCalls = (msg: Partial<AppMessage>): unknown[] => Array.isArray(msg.tool_calls) ? msg.tool_calls : [];

export const isVisibleMessage = (msg: BaseMessage): boolean => {
  const message = msg as AppMessage;
  const kind = getMessageKind(message);
  const text = getMessageText(message).trim();
  const toolCalls = getToolCalls(message);

  if (kind === "tool" || (kind === "ai" && !text && toolCalls.length > 0)) return false;
  return kind === "human" || kind === "ai";
};
