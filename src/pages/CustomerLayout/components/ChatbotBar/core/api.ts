import { AGENT_URL, THREAD_STORAGE_KEY } from "./constants";

export async function createThread(): Promise<string> {
  const res = await fetch(`${AGENT_URL}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Không tạo được thread: ${res.status} - ${await res.text()}`);
  
  const data = await res.json();
  if (!data.thread_id) throw new Error("Server không trả về thread_id");
  
  return data.thread_id;
}

export async function getStoredOrCreateThread(): Promise<string> {
  const cachedThreadId = localStorage.getItem(THREAD_STORAGE_KEY);
  if (cachedThreadId) return cachedThreadId;
  const newThreadId = await createThread();
  localStorage.setItem(THREAD_STORAGE_KEY, newThreadId);
  return newThreadId;
}
