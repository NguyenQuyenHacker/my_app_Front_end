import axios from "axios";
import { getAdminToken, clearAdminAuth } from "../../utils/authUtils";

const adminApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear token and redirect to login
    if (error.response && error.response.status === 401) {
      clearAdminAuth();
      // Only redirect if not already on login page to avoid infinite loop
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;