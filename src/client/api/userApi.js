import api from "./axios";

export const loginUser = async (phone, password) => {
  const response = await api.post("/login", {
    phone,
    password,
  });

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/overview");
  return response.data;
};