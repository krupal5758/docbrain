import { useState } from "react";
import { DocumentProvider } from "./contexts/DocumentContext.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import SummaryPanel from "./components/analysis/SummaryPanel.jsx";
import EntityPanel from "./components/analysis/EntityPanel.jsx";
import QuestionsPanel from "./components/analysis/QuestionsPanel.jsx";
import SentimentPanel from "./components/analysis/SentimentPanel.jsx";
import ConceptMap from "./components/analysis/ConceptMap.jsx";
import ChatPanel from "./components/chat/ChatPanel.jsx";

const PANELS = {
  summary: SummaryPanel,
  entities: EntityPanel,
  questions: QuestionsPanel,
  sentiment: SentimentPanel,
  conceptMap: ConceptMap,
  chat: ChatPanel,
};

function AppContent() {
  const [activeTab, setActiveTab] = useState("summary");
  const Panel = PANELS[activeTab] || SummaryPanel;

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBoundary key={activeTab}>
        <Panel />
      </ErrorBoundary>
    </AppLayout>
  );
}

export default function App() {
  return (
    <DocumentProvider>
      <AppContent />
    </DocumentProvider>
  );
}
