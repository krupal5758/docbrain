export default function TabBar({ tabs, activeTab, onTabChange, className = "" }) {
  return (
    <div className={`flex border-b ${className}`} style={{ borderColor: "#1e2d3d" }}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              active
                ? "border-accent-green text-text-primary"
                : "border-transparent text-text-muted hover:text-text-primary hover:border-border"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
