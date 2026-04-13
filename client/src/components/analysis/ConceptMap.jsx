import { useState, useEffect, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import {
  ReactFlow, ReactFlowProvider, MiniMap, Controls, Background,
  useNodesState, useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAnalysis } from "../../hooks/useAnalysis.js";

const NODE_STYLES = {
  main:    { bg: "#10b981", border: "#059669", text: "#000",    fontSize: 14, padding: "10px 16px", fontWeight: 700 },
  concept: { bg: "#1e293b", border: "#6366f1", text: "#e2e8f0", fontSize: 12, padding: "8px 12px",  fontWeight: 600 },
  detail:  { bg: "#1e293b", border: "#475569", text: "#94a3b8", fontSize: 11, padding: "6px 10px",  fontWeight: 400 },
  entity:  { bg: "#1e293b", border: "#f59e0b", text: "#fcd34d", fontSize: 11, padding: "6px 10px",  fontWeight: 500 },
};

function CustomNode({ data }) {
  const [showDesc, setShowDesc] = useState(false);
  const s = NODE_STYLES[data.type] || NODE_STYLES.detail;
  return (
    <div
      onClick={() => setShowDesc(!showDesc)}
      style={{
        background: s.bg, border: `2px solid ${s.border}`, borderRadius: 10,
        padding: s.padding, color: s.text, fontSize: s.fontSize, fontWeight: s.fontWeight,
        cursor: "pointer", maxWidth: 160, position: "relative",
        boxShadow: data.type === "main" ? `0 0 20px ${s.border}44` : "none",
      }}
    >
      <div className="text-center leading-tight">{data.label}</div>
      {showDesc && data.description && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)", background: "#0f172a",
          border: "1px solid #475569", borderRadius: 8, padding: "8px 10px",
          width: 220, color: "#94a3b8", fontSize: 11, fontWeight: 400,
          zIndex: 999, lineHeight: 1.5, pointerEvents: "none",
        }}>
          {data.description}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

function layoutNodes(rawNodes, rawEdges) {
  const cols = Math.max(2, Math.ceil(Math.sqrt(rawNodes.length)));
  const nodes = rawNodes.map((n, i) => ({
    id: n.id,
    type: "custom",
    position: { x: (i % cols) * 230, y: Math.floor(i / cols) * 170 },
    data: { label: n.label, type: n.type || "detail", description: n.description },
  }));
  const mainIdx = nodes.findIndex((n) => n.data.type === "main");
  if (mainIdx > 0) {
    const [mainNode] = nodes.splice(mainIdx, 1);
    mainNode.position = { x: ((cols - 1) * 230) / 2, y: -170 };
    nodes.unshift(mainNode);
  }
  const edges = rawEdges.map((e, i) => ({
    id: `e-${i}`, source: e.source, target: e.target, label: e.label,
    style: { stroke: "#475569", strokeWidth: 1.5 },
    labelStyle: { fill: "#94a3b8", fontSize: 10 },
    type: "smoothstep",
  }));
  return { nodes, edges };
}

function FlowInner({ rawNodes, rawEdges }) {
  const { nodes: ln, edges: le } = useMemo(() => layoutNodes(rawNodes, rawEdges), [rawNodes, rawEdges]);
  const [nodes, , onNodesChange] = useNodesState(ln);
  const [edges, , onEdgesChange] = useEdgesState(le);
  return (
    <ReactFlow
      nodes={nodes} edges={edges}
      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.2 }}
      minZoom={0.3} style={{ background: "#0f172a" }}
    >
      <Background color="#334155" gap={24} size={1} />
      <Controls />
      <MiniMap
        nodeColor={(n) => ({ main: "#10b981", concept: "#6366f1", detail: "#475569", entity: "#f59e0b" }[n.data?.type] || "#475569")}
        style={{ background: "#1e293b", border: "1px solid #475569" }}
      />
    </ReactFlow>
  );
}

export default function ConceptMap() {
  const { analyze, getCached, isLoading, getError } = useAnalysis();

  useEffect(() => { analyze("conceptMap"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = isLoading("conceptMap");
  const error = getError("conceptMap");
  const result = getCached("conceptMap");

  return (
    <div className="bg-bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-text-primary font-semibold text-lg">Concept Map</h2>
          <p className="text-text-muted text-xs mt-0.5">Click nodes to see descriptions · drag to rearrange</p>
        </div>
        {result && (
          <button onClick={() => analyze("conceptMap", {}, true)} disabled={loading} title="Regenerate"
            className="p-1.5 text-text-muted hover:text-accent-green transition-colors disabled:opacity-40">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-accent-rose/10 border border-accent-rose/30 rounded-lg flex items-center justify-between mb-4">
          <span className="text-accent-rose text-sm">{error}</span>
          <button onClick={() => analyze("conceptMap", {}, true)} className="text-accent-rose text-xs underline ml-3">Retry</button>
        </div>
      )}

      {loading && !result && (
        <div className="h-96 flex items-center justify-center bg-bg-primary rounded-xl">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-bg-surface-light border-t-accent-green rounded-full animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm">Building concept map…</p>
          </div>
        </div>
      )}

      {result?.nodes?.length > 0 && (
        <div className="h-96 rounded-xl overflow-hidden border border-border">
          <ReactFlowProvider>
            <FlowInner rawNodes={result.nodes} rawEdges={result.edges || []} />
          </ReactFlowProvider>
        </div>
      )}

      {result && !result.nodes?.length && (
        <p className="text-text-muted text-sm text-center py-12">No concepts extracted.</p>
      )}
    </div>
  );
}
