import apiClient from "./client.js";

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function uploadText(text, filename = "pasted-text.txt") {
  const { data } = await apiClient.post("/upload", { text, filename });
  return data;
}

export async function analyzeDocument(text, analysisType, options = {}) {
  const { data } = await apiClient.post("/analyze", { text, analysisType, options });
  return data;
}

export async function chatWithDocument(text, question, history = []) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, question, history }),
  });
  return response;
}
