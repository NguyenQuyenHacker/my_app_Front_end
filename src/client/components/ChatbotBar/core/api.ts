import { getAccessToken } from "./utils";
import { BACKEND_URL } from "./constants";
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
