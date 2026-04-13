import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        copied
          ? "bg-accent-green/20 text-accent-green"
          : "bg-bg-surface-light text-text-muted hover:text-text-primary"
      } ${className}`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
