import api from "./axios";

export const createTransfer = async (payload) => {
  const response = await api.post("/transfer", payload);
  return response.data;
};   