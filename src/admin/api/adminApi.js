import adminApi from "./axios";

const API_URL = "http://127.0.0.1:8000";

export const loginAdmin = async (email, password) => {
  const res = await adminApi.post("/admin/login", {
    email,
    password,
  });
  return res.data;
};
