import axios from "axios";
import { getClientToken, clearClientToken } from "../../utils/authUtils";

const clientApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

clientApi.interceptors.request.use((config) => {
  const token = getClientToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

clientApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear token and redirect to login
    if (error.response && error.response.status === 401) {
      clearClientToken();
      // Only redirect if not already on login page to avoid infinite loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default clientApi;