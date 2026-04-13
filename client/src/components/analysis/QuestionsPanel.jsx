import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import TabBar from "../common/TabBar.jsx";
import CopyButton from "../common/CopyButton.jsx";
import { useAnalysis } from "../../hooks/useAnalysis.js";

const QUESTION_TYPES = [
  { id: "factual", label: "Factual", color: "text-accent-green" },
  { id: "analytical", label: "Analytical", color: "text-accent-amber" },
  { id: "criticalThinking", label: "Critical", color: "text-accent-rose" },
];

function QuestionCard({ question, suggestedAnswer, typeColor }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-bg-surface-light/40 transition-colors"
      >
        <span className={`mt-0.5 flex-shrink-0 ${typeColor}`}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
        <span className="text-text-primary text-sm leading-relaxed">{question}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="ml-7 p-3 bg-bg-primary rounded-lg">
            <p className="text-text-muted text-xs uppercase tracking-wide font-medium mb-1">Suggested Answer</p>
            <p className="text-text-primary text-sm leading-relaxed">{suggestedAnswer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonQuestion() {
  return (
    <div className="border border-border rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-bg-surface-light rounded mb-2 w-full" />
      <div className="h-4 bg-bg-surface-light rounded w-3/4" />
    </div>
  );
}

export default function QuestionsPanel() {
  const [activeType, setActiveType] = useState("factual");
  const { analyze, getCached, isLoading, getError } = useAnalysis();

  useEffect(() => { analyze("questions"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = isLoading("questions");
  const error = getError("questions");
  const result = getCached("questions");
  const currentType = QUESTION_TYPES.find((t) => t.id === activeType);
  const questions = result?.[activeType] || [];

  const allText = result
    ? [...(result.factual || []), ...(result.analytical || []), ...(result.criticalThinking || [])]
        .map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.suggestedAnswer}`)
        .join("\n\n")
    : "";

  return (
    <div className="bg-bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-text-primary font-semibold text-lg">Study Questions</h2>
        <div className="flex items-center gap-2">
          {result && <CopyButton text={allText} />}
          {result && (
            <button
              onClick={() => analyze("questions", {}, true)}
              disabled={loading}
              title="Regenerate"
              className="p-1.5 text-text-muted hover:text-accent-green transition-colors disabled:opacity-40"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      </div>

      <TabBar
        tabs={QUESTION_TYPES.map((t) => ({ id: t.id, label: `${t.label} (${result?.[t.id]?.length || 0})` }))}
        activeTab={activeType}
        onTabChange={setActiveType}
        className="mb-4"
      />

      {error && (
        <div className="p-3 bg-accent-rose/10 border border-accent-rose/30 rounded-lg flex items-center justify-between mb-3">
          <span className="text-accent-rose text-sm">{error}</span>
          <button onClick={() => analyze("questions", {}, true)} className="text-accent-rose text-xs underline ml-3">Retry</button>
        </div>
      )}

      {loading && !result && <div className="space-y-3">{[1,2,3].map(i => <SkeletonQuestion key={i} />)}</div>}

      {result && (
        <div className="space-y-3">
          {questions.length === 0
            ? <p className="text-text-muted text-sm text-center py-6">No questions in this category.</p>
            : questions.map((q, i) => (
                <QuestionCard
                  key={i}
                  question={q.question}
                  suggestedAnswer={q.suggestedAnswer}
                  typeColor={currentType?.color || "text-text-muted"}
                />
              ))}
        </div>
      )}
    </div>
  );
}
