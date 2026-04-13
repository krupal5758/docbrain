import { useState, useCallback } from "react";
import { useDocument } from "./useDocument.js";

export function useChat() {
  const { text } = useDocument();
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (question) => {
      if (!text || !question.trim() || isStreaming) return;

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
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
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
            } catch {}
          }
        }
      } catch (err) {
        setError(err.message);
        setMessages((prev) => prev.slice(0, -1)); // Remove empty assistant message
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
