import { getAccessToken } from "./utils";
import { BACKEND_URL, AGENT_HTTP_URL } from "./constants";
import { UserThread, ChatMessage } from "./types";

// Nạp lịch sử hội thoại từ serving agent (SQLAlchemySession) khi mở/đổi thread.
export async function fetchSessionMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  const res = await fetch(`${AGENT_HTTP_URL}/agent/sessions/${sessionId}/messages`);
  if (!res.ok) return [];
  const rows: { role: "user" | "assistant"; content: string }[] = await res.json();
  return rows.map((r, i) => ({ id: `h-${i}`, role: r.role, content: r.content }));
}

export interface ChatQuota {
  used: number;
  limit: number;
  remaining: number;
  is_exceeded: boolean;
  reset_at: string;
}

export async function fetchQuota(): Promise<ChatQuota> {
  const token = getAccessToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${BACKEND_URL}/chat/quota`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Không lấy được hạn mức token: ${res.status}`);
  }

  return res.json();
}

export async function fetchMyThreads(): Promise<UserThread[]> {
  const token = getAccessToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${BACKEND_URL}/chat/threads`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Không lấy được danh sách thread: ${res.status}`);
  }

  return res.json();
}

export async function createNewThread(): Promise<UserThread> {
  const token = getAccessToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${BACKEND_URL}/chat/threads/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error(`Không khởi tạo được cuộc trò chuyện: ${res.status}`);
  }

  return res.json();
}

export async function deleteThreadAPI(threadId: string): Promise<void> {
  const token = getAccessToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${BACKEND_URL}/chat/threads/${threadId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Không xóa được cuộc trò chuyện: ${res.status}`);
  }
}

export async function updateThreadTitleAPI(
  threadId: string,
  title: string
): Promise<UserThread> {
  const token = getAccessToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${BACKEND_URL}/chat/threads/${threadId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    throw new Error(`Không cập nhật được tiêu đề: ${res.status}`);
  }

  return res.json();
}
