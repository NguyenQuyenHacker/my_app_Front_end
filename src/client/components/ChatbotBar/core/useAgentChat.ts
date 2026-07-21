import { useCallback, useEffect, useRef, useState } from "react";
import { AGENT_WS_URL } from "./constants";
import { getAccessToken } from "./utils";
import { fetchSessionMessages } from "./api";
import type { ChatMessage } from "./types";
import type { PendingTransfer } from "../components/TransferConfirmCard";

let _seq = 0;
const uid = (p: string) => `${p}-${Date.now()}-${_seq++}`;

/**
 * Hook chat qua WebSocket tới serving agent (thay useStream của langchain).
 * - Nạp lịch sử từ serving khi đổi thread.
 * - Mở WS /agent/ws/chat/{threadId}?token=<jwt> (browser WS không set được header → query param).
 * - send(): optimistic user + placeholder assistant, gom token stream về.
 * Hội thoại tuyến tính — KHÔNG branching/checkpoint.
 */
export function useAgentChat(threadId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  // Payload từ tool transfer_init (serving gửi event {type:"transfer"}) -> FE điền form & navigate.
  const [pendingTransfer, setPendingTransfer] = useState<PendingTransfer | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamingIdRef = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    setMessages([]);
    setIsLoading(false);
    setConnected(false);
    setPendingTransfer(null);
    streamingIdRef.current = null;

    // Lịch sử
    fetchSessionMessages(threadId)
      .then((hist) => {
        if (alive) setMessages(hist);
      })
      .catch(() => {});

    // WebSocket
    const token = getAccessToken() ?? "";
    const ws = new WebSocket(
      `${AGENT_WS_URL}/agent/ws/chat/${threadId}?token=${encodeURIComponent(token)}`
    );
    wsRef.current = ws;

    ws.onopen = () => alive && setConnected(true);
    ws.onclose = () => alive && setConnected(false);
    ws.onerror = () => alive && setConnected(false);
    ws.onmessage = (ev) => {
      if (!alive) return;
      let msg: any;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      const sid = streamingIdRef.current;
      if (msg.type === "token") {
        setMessages((prev) =>
          prev.map((m) => (m.id === sid ? { ...m, content: m.content + msg.data } : m))
        );
      } else if (msg.type === "done") {
        setIsLoading(false);
        streamingIdRef.current = null;
      } else if (msg.type === "error") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === sid ? { ...m, content: (m.content ? m.content + "\n" : "") + `⚠️ ${msg.data}` } : m
          )
        );
        setIsLoading(false);
        streamingIdRef.current = null;
      } else if (msg.type === "transfer") {
        // tool transfer_init khởi tạo phiên -> FE điền form & chuyển trang chuyển khoản
        setPendingTransfer(msg.data);
      }
      // msg.type === "tool": có thể hiển thị "đang tra cứu..." nếu muốn (bỏ qua ở đây)
    };

    return () => {
      alive = false;
      // Tránh warning "closed before the connection is established" (StrictMode dev):
      // nếu WS còn đang CONNECTING thì đợi mở xong mới đóng sạch.
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.addEventListener("open", () => ws.close());
      } else if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [threadId]);

  const send = useCallback(
    (text: string): boolean => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || isLoading) return false;
      const userMsg: ChatMessage = { id: uid("u"), role: "user", content: text };
      const aId = uid("a");
      streamingIdRef.current = aId;
      setMessages((prev) => [...prev, userMsg, { id: aId, role: "assistant", content: "" }]);
      setIsLoading(true);
      ws.send(text);
      return true;
    },
    [isLoading]
  );

  const clearPendingTransfer = useCallback(() => setPendingTransfer(null), []);

  return { messages, isLoading, connected, send, pendingTransfer, clearPendingTransfer };
}
