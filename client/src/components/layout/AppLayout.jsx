import Sidebar from "./Sidebar.jsx";
import { useDocument } from "../../hooks/useDocument.js";
import { FileText, Layers, MessageSquare } from "lucide-react";

const FEATURES = [
  {
    Icon: FileText,
    title: "Instant Analysis",
    desc: "Summaries, entities, questions, and sentiment — all from one upload.",
  },
  {
    Icon: Layers,
    title: "Concept Mapping",
    desc: "Visualize how ideas connect inside your document.",
  },
  {
    Icon: MessageSquare,
    title: "Ask Anything",
    desc: "Chat with the document. Get precise, grounded answers.",
  },
];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[520px] text-center px-8 select-none">
      {/* Wordmark */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs text-text-muted mb-6" style={{ borderColor: "#1e2d3d" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block" />
          Powered by Gemini 2.5
        </div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-3">
          Read less.<br />
          <span className="text-accent-green">Understand more.</span>
        </h1>
        <p className="text-text-muted text-sm max-w-xs mx-auto leading-relaxed">
          Drop in a PDF, Word doc, or paste raw text. DocBrain handles the rest.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
        {FEATURES.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl p-4 text-left border"
            style={{ background: "#111827", borderColor: "#1e2d3d" }}
          >
            <div className="w-7 h-7 rounded-lg bg-accent-green/10 flex items-center justify-center mb-3">
              <Icon size={14} className="text-accent-green" />
            </div>
            <p className="text-text-primary text-xs font-semibold mb-1">{title}</p>
            <p className="text-text-muted text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppLayout({ children, activeTab, onTabChange }) {
  const { status } = useDocument();

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {status !== "ready" ? <EmptyState /> : (
            <div className="animate-fadeup">
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
