import { useState, useRef, useEffect } from "react";
import { Send, Trash2, MessageSquare } from "lucide-react";
import ChatMessage from "./ChatMessage.jsx";
import { useChat } from "../../hooks/useChat.js";
import { useDocument } from "../../hooks/useDocument.js";

const SUGGESTED = [
  "What is the main argument of this document?",
  "Summarize the key findings.",
  "What evidence supports the main claims?",
  "What are the limitations mentioned?",
  "Who is the intended audience?",
];

export default function ChatPanel() {
  const { status } = useDocument();
  const { messages, isStreaming, error, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e) {
    e?.preventDefault();
    const q = input.trim();
    if (!q || isStreaming) return;
    setInput("");
    await sendMessage(q);
    inputRef.current?.focus();
  }

  if (status !== "ready") {
    return (
      <div className="bg-bg-surface rounded-xl border border-border p-5 flex items-center justify-center h-64">
        <p className="text-text-muted text-sm">Upload a document to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface rounded-xl border border-border flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div>
          <h2 className="text-text-primary font-semibold">Chat with Document</h2>
          <p className="text-text-muted text-xs mt-0.5">Ask anything about your document</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            title="Clear chat"
            className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted hover:text-accent-rose text-xs rounded-lg hover:bg-accent-rose/10 transition-colors"
          >
            <Trash2 size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center mb-3">
              <MessageSquare size={18} className="text-accent-green" />
            </div>
            <p className="text-text-primary font-semibold mb-1">Ask about the document</p>
            <p className="text-text-muted text-sm mb-6">Answers are grounded in the document content.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 bg-bg-surface-light text-text-muted text-xs rounded-full hover:text-text-primary hover:bg-bg-surface-light/80 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id || i}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}
            {error && (
              <div className="p-3 bg-accent-rose/10 border border-accent-rose/30 rounded-lg text-accent-rose text-sm mb-4">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-border flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the document…"
            disabled={isStreaming}
            className="flex-1 bg-bg-primary border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent-green transition-colors disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="w-10 h-10 flex items-center justify-center bg-accent-green text-bg-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-green/90 transition-colors flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
