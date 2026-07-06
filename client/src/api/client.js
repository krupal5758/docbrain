import axios from "axios";

const ACCESS_CODE_KEY = "docbrain_access_code";

export function getAccessCode() {
  return localStorage.getItem(ACCESS_CODE_KEY) || "";
}

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

apiClient.interceptors.request.use((config) => {
  const code = getAccessCode();
  if (code) config.headers["x-access-code"] = code;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Server is gated (ACCESS_CODE set): ask once, store, and retry the request.
    if (error.response?.data?.error?.code === "ACCESS_CODE_REQUIRED") {
      const entered = window.prompt("This DocBrain instance requires an access code:");
      if (entered) {
        localStorage.setItem(ACCESS_CODE_KEY, entered.trim());
        return apiClient.request(error.config);
      }
    }
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
