import { getAccessToken } from "./utils";
import { BACKEND_URL, AGENT_URL } from "./constants";
import { UserThread } from "./types";

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

export async function createLangGraphThread(): Promise<string> {
  const res = await fetch(`${AGENT_URL}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error(`Không tạo được thread LangGraph: ${res.status}`);
  }

  const data = await res.json();
  if (!data.thread_id) throw new Error("LangGraph không trả về thread_id");
  return data.thread_id;
}

export async function saveUserThreadMapping(
  threadId: string,
  title = "Cuộc trò chuyện mới"
): Promise<UserThread> {
  const token = getAccessToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${BACKEND_URL}/chat/threads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      thread_id: threadId,
      title,
    }),
  });

  if (!res.ok) {
    throw new Error(`Không lưu được thread mapping: ${res.status}`);
  }

  return res.json();
}
