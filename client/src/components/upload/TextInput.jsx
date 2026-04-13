import { useState } from "react";
import { useDocument } from "../../hooks/useDocument.js";

const MAX = 400_000;

export default function TextInput({ onDone }) {
  const [text, setText] = useState("");
  const { setDocument, status } = useDocument();
  const uploading = status === "uploading";
  const over = text.length > MAX;

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || over) return;
    await setDocument({ text, filename: "pasted-text.txt" });
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your document here…"
        rows={7}
        disabled={uploading}
        className="w-full rounded-lg p-3 text-xs text-text-primary placeholder-text-muted resize-none focus:outline-none transition-colors font-mono leading-relaxed"
        style={{ background: "#0b0f1a", border: "1px solid #1e2d3d" }}
        onFocus={(e) => (e.target.style.borderColor = "#10b981")}
        onBlur={(e) => (e.target.style.borderColor = "#1e2d3d")}
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${over ? "text-accent-rose" : "text-text-muted"}`}>
          {text.length.toLocaleString()} / {MAX.toLocaleString()}
        </span>
        <button
          type="submit"
          disabled={!text.trim() || over || uploading}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent-green text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-green/90 transition-colors"
        >
          {uploading ? "Analyzing…" : "Analyze"}
        </button>
      </div>
    </form>
  );
}
