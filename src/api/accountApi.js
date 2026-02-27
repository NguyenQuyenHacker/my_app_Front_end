import api from "./axios";

export const getAccountOverview = async () => {
  const response = await api.get("/account");
  return response.data;
};