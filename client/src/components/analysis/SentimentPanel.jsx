import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from "recharts";
import { useAnalysis } from "../../hooks/useAnalysis.js";

const EMOTIONS = ["joy", "trust", "anticipation", "surprise", "fear", "sadness", "anger", "disgust"];

function SentimentGauge({ score }) {
  const normalized = Math.max(0, Math.min(1, (score + 1) / 2));
  const color = score > 0.2 ? "#10b981" : score < -0.2 ? "#f43f5e" : "#f59e0b";
  const label =
    score > 0.5 ? "Very Positive" : score > 0.2 ? "Positive" :
    score > -0.2 ? "Neutral" : score > -0.5 ? "Negative" : "Very Negative";

  const angle = normalized * 180 - 90;
  const needleX = 60 + 38 * Math.cos(((angle - 90) * Math.PI) / 180);
  const needleY = 60 + 38 * Math.sin(((angle - 90) * Math.PI) / 180);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-36 h-20 overflow-hidden">
        <svg viewBox="0 0 120 64" className="w-full">
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${normalized * 157} 157`} opacity="0.85"
          />
          <line x1="60" y1="60" x2={needleX} y2={needleY} stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="60" cy="60" r="4" fill={color} />
        </svg>
      </div>
      <p className="font-semibold text-sm" style={{ color }}>{label}</p>
      <p className="text-text-muted text-xs">{score >= 0 ? "+" : ""}{Number(score).toFixed(2)}</p>
    </div>
  );
}

function ProgressBar({ value, label, color = "#10b981" }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-text-muted text-xs w-24 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-bg-surface-light rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
      </div>
      <span className="text-text-muted text-xs w-8 flex-shrink-0">{Math.round(value)}</span>
    </div>
  );
}

const READABILITY_LABELS = {
  elementary: "Elementary",
  middle_school: "Middle School",
  high_school: "High School",
  college: "College",
  expert: "Expert",
};

export default function SentimentPanel() {
  const { analyze, getCached, isLoading, getError } = useAnalysis();

  useEffect(() => { analyze("sentiment"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = isLoading("sentiment");
  const error = getError("sentiment");
  const result = getCached("sentiment");

  const radarData = result?.emotionalBreakdown
    ? EMOTIONS.map((e) => ({
        subject: e.charAt(0).toUpperCase() + e.slice(1),
        value: Number(result.emotionalBreakdown[e]) || 0,
      }))
    : [];

  return (
    <div className="bg-bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-text-primary font-semibold text-lg">Sentiment & Tone</h2>
        {result && (
          <button onClick={() => analyze("sentiment", {}, true)} disabled={loading} title="Regenerate"
            className="p-1.5 text-text-muted hover:text-accent-green transition-colors disabled:opacity-40">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-accent-rose/10 border border-accent-rose/30 rounded-lg flex items-center justify-between mb-4">
          <span className="text-accent-rose text-sm">{error}</span>
          <button onClick={() => analyze("sentiment", {}, true)} className="text-accent-rose text-xs underline ml-3">Retry</button>
        </div>
      )}

      {loading && !result && (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-bg-surface-light rounded-xl" />
          <div className="h-8 bg-bg-surface-light rounded" />
          <div className="h-56 bg-bg-surface-light rounded-xl" />
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <SentimentGauge score={Number(result.sentimentScore) || 0} />
            <div className="flex-1 space-y-3">
              {result.tones?.length > 0 && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wide font-medium mb-2">Tones</p>
                  <div className="flex flex-wrap gap-2">
                    {result.tones.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 bg-accent-indigo/15 text-accent-indigo text-xs rounded-full">
                        {t.tone} <span className="opacity-60">({t.confidence}%)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wide font-medium mb-2">Metrics</p>
                <div className="space-y-2">
                  <ProgressBar value={Number(result.confidence) || 0} label="Confidence" color="#6366f1" />
                  <ProgressBar value={Number(result.objectivityScore) || 50} label="Objectivity" color="#06b6d4" />
                </div>
              </div>
            </div>
          </div>

          {radarData.length > 0 && (
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wide font-medium mb-3">Emotional Breakdown</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: 8, color: "#f1f5f9", fontSize: 12 }}
                      formatter={(v) => [`${v}%`, "Intensity"]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {result.readabilityLevel && (
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wide font-medium mb-2">Readability</p>
              <span className="px-3 py-1.5 bg-accent-amber/15 text-accent-amber text-sm font-medium rounded-lg">
                {READABILITY_LABELS[result.readabilityLevel] || result.readabilityLevel}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
