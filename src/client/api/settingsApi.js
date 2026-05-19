import api from "./axios";

export const getPreferences = async () => {
  const response = await api.get("/settings/preferences");
  return response.data;
};

export const updatePreferences = async (payload) => {
  const response = await api.patch("/settings/preferences", payload);
  return response.data;
};

export const updateProfile = async (payload) => {
  const response = await api.post("/settings/profile/update", payload);
  return response.data;
};

export const changePassword = async (payload) => {
  const response = await api.post("/settings/security/change-password", payload);
  return response.data;
};

export const changePin = async (payload) => {
  const response = await api.post("/settings/security/change-pin", payload);
  return response.data;
};

export const getLastLogin = async () => {
  const response = await api.get("/settings/security/last-login");
  return response.data;
};
