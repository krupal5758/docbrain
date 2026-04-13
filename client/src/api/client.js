import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
