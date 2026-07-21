const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

// BE nghiệp vụ (threads per-user, quota, API tài khoản/chuyển khoản)
export const BACKEND_URL = API_BASE;

// Serving agent (Agents SDK) — process riêng, mặc định :2024
export const AGENT_HTTP_URL =
  (import.meta as any).env?.VITE_AGENT_HTTP_URL || "http://localhost:2024";
export const AGENT_WS_URL =
  (import.meta as any).env?.VITE_AGENT_WS_URL || "ws://localhost:2024";

export const ACCESS_TOKEN_KEY = "token";
