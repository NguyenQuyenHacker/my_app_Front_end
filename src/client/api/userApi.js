import api from "./axios";

export const loginUser = async (phone, password) => {
  const response = await api.post("/login", {
    phone,
    password,
  });

  return response.data;
};

export const registerUser = async (payload) => {
  const response = await api.post("/register", payload);
  return response.data;
};

export const getCustomerInfo = async () => {
  const response = await api.get("/info");
  return response.data;
};

export const getCustomerHomePage = async () => {
  const response = await api.get("/home-page");
  return response.data;
};
