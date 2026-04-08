import adminApi from "./axios";

export const loginAdmin = async (email, password) => {
  const res = await adminApi.post("/admin/login", {
    email,
    password,
  });
  return res.data;
};

export const getAdminMe = async () => {
  const res = await adminApi.get("/admin/me");
  return res.data;
};
