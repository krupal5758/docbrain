import { useState, useEffect } from "react";
import { RefreshCw, User, Building2, MapPin, Calendar, Key, BarChart2 } from "lucide-react";
import { useAnalysis } from "../../hooks/useAnalysis.js";

const CATEGORIES = [
  { key: "people", label: "People", color: "text-accent-indigo bg-accent-indigo/15", Icon: User },
  { key: "organizations", label: "Organizations", color: "text-accent-cyan bg-accent-cyan/15", Icon: Building2 },
  { key: "locations", label: "Locations", color: "text-accent-green bg-accent-green/15", Icon: MapPin },
  { key: "dates", label: "Dates", color: "text-accent-amber bg-accent-amber/15", Icon: Calendar },
  { key: "keyTerms", label: "Key Terms", color: "text-accent-rose bg-accent-rose/15", Icon: Key },
  { key: "statistics", label: "Statistics", color: "text-purple-400 bg-purple-400/15", Icon: BarChart2 },
];

function EntityChip({ name, context, colorClass }) {
  const [showContext, setShowContext] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowContext(!showContext)}
        className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${colorClass}`}
      >
        {name}
      </button>
      {showContext && (
        <div className="absolute z-10 bottom-full mb-2 left-0 w-56 p-2.5 bg-bg-primary border border-border rounded-lg shadow-xl text-text-muted text-xs leading-relaxed">
          {context}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, items }) {
  const [isOpen, setIsOpen] = useState(true);
  if (!items?.length) return null;
  const nameKey = category.key === "keyTerms" ? "term" : category.key === "statistics" ? "value" : "name";
  const contextKey = category.key === "keyTerms" ? "definition" : "context";

  return (
    <div className="mb-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 mb-2 w-full text-left">
        <category.Icon size={13} className={category.color.split(" ")[0]} />
        <span className="text-text-primary text-sm font-medium">{category.label}</span>
        <span className={`px-1.5 py-0.5 text-xs rounded-full ${category.color}`}>{items.length}</span>
        <span className="ml-auto text-text-muted text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="flex flex-wrap gap-2 pl-6">
          {items.map((item, i) => (
            <EntityChip
              key={i}
              name={item[nameKey] || ""}
              context={item[contextKey] || "No context available"}
              colorClass={category.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="mb-4 animate-pulse">
      <div className="h-4 w-32 bg-bg-surface-light rounded mb-3" />
      <div className="flex gap-2 pl-6">
        {[60, 80, 50, 70].map((w, i) => (
          <div key={i} className="h-6 bg-bg-surface-light rounded-full" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

export default function EntityPanel() {
  const { analyze, getCached, isLoading, getError } = useAnalysis();

  useEffect(() => { analyze("entities"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = isLoading("entities");
  const error = getError("entities");
  const result = getCached("entities");
  const total = result ? CATEGORIES.reduce((s, c) => s + (result[c.key]?.length || 0), 0) : 0;

  return (
    <div className="bg-bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-text-primary font-semibold text-lg">Entity Extraction</h2>
          {result && <p className="text-text-muted text-xs mt-0.5">{total} entities found</p>}
        </div>
        {result && (
          <button
            onClick={() => analyze("entities", {}, true)}
            disabled={loading}
            title="Regenerate"
            className="p-1.5 text-text-muted hover:text-accent-green transition-colors disabled:opacity-40"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-accent-rose/10 border border-accent-rose/30 rounded-lg flex items-center justify-between mb-3">
          <span className="text-accent-rose text-sm">{error}</span>
          <button onClick={() => analyze("entities", {}, true)} className="text-accent-rose text-xs underline ml-3">Retry</button>
        </div>
      )}

      {loading && !result && <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>}

      {result && (
        <div>
          {CATEGORIES.map((cat) => <CategorySection key={cat.key} category={cat} items={result[cat.key]} />)}
          {total === 0 && <p className="text-text-muted text-sm text-center py-8">No entities found.</p>}
        </div>
      )}
    </div>
  );
}
