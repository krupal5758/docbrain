import { useState, useCallback, useEffect, useRef } from "react";
import { useDocument } from "./useDocument.js";

export function useChat() {
  const { text } = useDocument();
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Abort any in-flight stream when the component unmounts so the fetch
  // doesn't keep updating unmounted state.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (question) => {
      if (!text || !question.trim() || isStreaming) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const userMsg = { role: "user", content: question, id: Date.now() };
      const assistantMsg = { role: "assistant", content: "", id: Date.now() + 1 };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, question, history }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        if (!response.body) {
          throw new Error("The server returned an empty response.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === "chunk") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + parsed.content,
                    };
                  }
                  return updated;
                });
              } else if (parsed.type === "error") {
                setError(parsed.message);
              }
            } catch (e) {
              console.warn("Failed to parse SSE line:", line, e);
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setMessages((prev) => prev.slice(0, -1)); // Remove empty assistant message
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [text, messages, isStreaming]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isStreaming, error, sendMessage, clearChat };
}
