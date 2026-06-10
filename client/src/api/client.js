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
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    wrapped.code = error.response?.data?.error?.code;
    wrapped.cause = error;
    return Promise.reject(wrapped);
  }
);

export default apiClient;
