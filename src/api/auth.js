// Mock API (bạn thay bằng fetch/axios về sau)
const DEMO_USER = {
  username: "customer@bank.com",
  password: "12345678",
  name: "Nguyễn Văn A",
};

export async function login({ username, password }) {
  await sleep(500);

  const ok = username === DEMO_USER.username && password === DEMO_USER.password;
  if (!ok) {
    const err = new Error("Sai tài khoản hoặc mật khẩu");
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  return {
    token: "demo_token_abc123",
    user: { name: DEMO_USER.name, username: DEMO_USER.username },
  };
}

export async function logout() {
  await sleep(150);
  return true;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
