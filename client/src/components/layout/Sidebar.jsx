import { useState, useEffect } from "react";
import {
  FileText, Tag, HelpCircle, BarChart2, GitBranch, MessageSquare,
  UploadCloud, Clock, Trash2, ChevronRight, X,
} from "lucide-react";
import UploadZone from "../upload/UploadZone.jsx";
import TextInput from "../upload/TextInput.jsx";
import { useDocument } from "../../hooks/useDocument.js";
import { getHistory, deleteHistoryItem } from "../../utils/storage.js";
import { formatRelativeTime } from "../../utils/formatters.js";

const NAV_ITEMS = [
  { id: "summary",    label: "Summary",     Icon: FileText    },
  { id: "entities",   label: "Entities",    Icon: Tag         },
  { id: "questions",  label: "Questions",   Icon: HelpCircle  },
  { id: "sentiment",  label: "Sentiment",   Icon: BarChart2   },
  { id: "conceptMap", label: "Concept Map", Icon: GitBranch   },
  { id: "chat",       label: "Chat",        Icon: MessageSquare },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const [inputMode, setInputMode] = useState("file");
  const { status, metadata, setDocument, clearDocument } = useDocument();
  const [history, setHistory] = useState([]);
  const hasDoc = status === "ready";

  useEffect(() => { setHistory(getHistory()); }, [status]);

  function handleHistoryLoad(item) {
    setDocument({ text: item.text, filename: item.fileName });
  }

  function handleHistoryDelete(id, e) {
    e.stopPropagation();
    deleteHistoryItem(id);
    setHistory(getHistory());
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r" style={{ borderColor: "#1e2d3d", background: "#0d1117" }}>

      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-accent-green flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-sm leading-none">D</span>
        </div>
        <div>
          <span className="text-text-primary font-bold text-base tracking-tight">DocBrain</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block" />
            <span className="text-text-muted text-xs">Document Intelligence</span>
          </div>
        </div>
      </div>

      {/* Upload toggle */}
      <div className="px-4 pb-3">
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#1e2d3d" }}>
          {["file", "text"].map((mode) => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                inputMode === mode
                  ? "bg-accent-green text-black"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {mode === "file" ? "Upload File" : "Paste Text"}
            </button>
          ))}
        </div>
      </div>

      {/* Upload area */}
      <div className="px-4 pb-4 border-b" style={{ borderColor: "#1e2d3d" }}>
        {inputMode === "file"
          ? <UploadZone />
          : <TextInput onDone={() => setInputMode("file")} />}
      </div>

      {/* Document metadata */}
      {hasDoc && metadata && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "#1e2d3d" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-text-primary text-xs font-medium truncate">{metadata.fileName}</p>
              <p className="text-text-muted text-xs mt-0.5">
                {metadata.wordCount?.toLocaleString()} words
              </p>
            </div>
            <button
              onClick={clearDocument}
              className="text-text-muted hover:text-text-primary mt-0.5 flex-shrink-0 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {hasDoc && (
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          <p className="text-text-muted text-xs font-medium uppercase tracking-widest px-3 mb-2">
            Analysis
          </p>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all group ${
                  active
                    ? "bg-accent-green/10 text-accent-green"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-surface-light/50"
                }`}
              >
                <Icon size={15} className={active ? "text-accent-green" : "text-text-muted group-hover:text-text-primary"} />
                {label}
                {active && <ChevronRight size={13} className="ml-auto text-accent-green/60" />}
              </button>
            );
          })}
        </nav>
      )}

      {!hasDoc && (
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="text-center">
            <UploadCloud size={24} className="text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-text-muted text-xs leading-relaxed">
              Upload a file or paste text to get started
            </p>
          </div>
        </div>
      )}

      {/* Recent history */}
      {history.length > 0 && (
        <div className="border-t px-2 py-3 max-h-48 overflow-y-auto" style={{ borderColor: "#1e2d3d" }}>
          <div className="flex items-center gap-2 px-3 mb-2">
            <Clock size={11} className="text-text-muted" />
            <p className="text-text-muted text-xs font-medium uppercase tracking-widest">Recent</p>
          </div>
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => handleHistoryLoad(item)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-bg-surface-light/50 group transition-colors mb-0.5"
            >
              <FileText size={12} className="text-text-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-xs truncate">{item.fileName}</p>
                <p className="text-text-muted text-xs">{formatRelativeTime(item.timestamp)}</p>
              </div>
              <button
                onClick={(e) => handleHistoryDelete(item.id, e)}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-rose transition-all"
              >
                <Trash2 size={11} />
              </button>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
