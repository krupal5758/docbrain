import { useState, useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";
import TabBar from "../common/TabBar.jsx";
import CopyButton from "../common/CopyButton.jsx";
import { useAnalysis } from "../../hooks/useAnalysis.js";

const STYLES = [
  { id: "executive", label: "Executive" },
  { id: "bullets", label: "Bullets" },
  { id: "eli5", label: "ELI5" },
  { id: "academic", label: "Academic" },
];

function SummarySkeleton() {
  return (
    <div className="mt-4 space-y-2 animate-pulse">
      {[100, 85, 70, 95, 60].map((w, i) => (
        <div key={i} className="h-4 bg-bg-surface-light rounded" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

export default function SummaryPanel() {
  const [style, setStyle] = useState("executive");
  const { analyze, getCached, isLoading, getError } = useAnalysis();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    analyze("summary", { style });
  }, [style]); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = isLoading("summary", { style });
  const error = getError("summary", { style });
  const result = getCached("summary", { style });
  const summaryText = result?.summary || "";

  return (
    <div className="bg-bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-text-primary font-semibold text-lg">Summary</h2>
        {result && (
          <div className="flex items-center gap-2">
            {result.wordCount && (
              <span className="text-text-muted text-xs bg-bg-surface-light px-2 py-1 rounded-md">
                ~{result.wordCount.toLocaleString()} words
              </span>
            )}
            <CopyButton text={summaryText} />
            <button
              onClick={() => analyze("summary", { style }, true)}
              disabled={loading}
              title="Regenerate"
              className="p-1.5 text-text-muted hover:text-accent-green transition-colors disabled:opacity-40"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        )}
      </div>

      <TabBar tabs={STYLES} activeTab={style} onTabChange={setStyle} className="mb-4" />

      {error && (
        <div className="mt-3 p-3 bg-accent-rose/10 border border-accent-rose/30 rounded-lg flex items-center justify-between">
          <span className="text-accent-rose text-sm">{error}</span>
          <button
            onClick={() => analyze("summary", { style }, true)}
            className="text-accent-rose hover:text-accent-rose/80 text-xs underline ml-3 flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !result && <SummarySkeleton />}

      {result && (
        <div className="mt-2">
          {style === "bullets" ? (
            <ul className="space-y-2">
              {summaryText
                .split("\n")
                .filter((l) => l.trim())
                .map((line, i) => (
                  <li key={i} className="flex gap-2 text-text-primary text-sm leading-relaxed">
                    <span className="text-accent-green mt-0.5 flex-shrink-0">•</span>
                    <span>{line.replace(/^[-•*]\s*/, "")}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
              {summaryText}
            </p>
          )}

          {result.keyPoints?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-text-muted text-xs uppercase tracking-wide font-medium mb-2">
                Key Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {result.keyPoints.map((point, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-accent-indigo/15 text-accent-indigo text-xs rounded-full"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
