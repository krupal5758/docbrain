import { Bot, User } from "lucide-react";
import CopyButton from "../common/CopyButton.jsx";

function renderContent(text) {
  // Basic markdown: bold, inline code, paragraphs
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const code = part.slice(3, -3).replace(/^[^\n]*\n/, "");
      return (
        <pre key={i} className="bg-bg-primary rounded-lg p-3 mt-2 overflow-x-auto text-xs font-mono text-text-primary">
          {code}
        </pre>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="px-1.5 py-0.5 bg-bg-surface-light rounded text-accent-cyan text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-accent-green/15 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <Bot size={14} className="text-accent-green" />
        </div>
      )}
      <div className={`max-w-[80%] group relative`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-accent-green text-bg-primary rounded-tr-sm"
              : "bg-bg-surface border border-border text-text-primary rounded-tl-sm"
          }`}
        >
          {renderContent(message.content)}
          {isStreaming && !isUser && message.content === "" && (
            <span className="inline-flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          )}
          {isStreaming && !isUser && message.content !== "" && (
            <span className="inline-block w-0.5 h-3.5 bg-accent-green animate-pulse ml-0.5 align-middle" />
          )}
        </div>
        {!isUser && message.content && (
          <div className="absolute -bottom-7 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-accent-indigo/15 flex items-center justify-center flex-shrink-0 ml-2 mt-0.5">
          <User size={14} className="text-accent-indigo" />
        </div>
      )}
    </div>
  );
}
