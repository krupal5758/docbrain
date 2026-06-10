const KEY = "docbrain_history";
const MAX_ITEMS = 20;
const MAX_TEXT_CHARS = 50_000;

export function saveToHistory(document) {
  const history = getHistory();
  const entry = {
    id: Date.now().toString(),
    fileName: document.metadata?.fileName || "Untitled",
    wordCount: document.metadata?.wordCount || 0,
    charCount: document.metadata?.charCount || 0,
    textPreview: (document.text || "").slice(0, 200),
    text: (document.text || "").slice(0, MAX_TEXT_CHARS),
    timestamp: Date.now(),
  };

  const updated = [entry, ...history.filter((h) => h.id !== entry.id)].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // localStorage full — remove oldest and retry
    const trimmed = updated.slice(0, MAX_ITEMS / 2);
    try {
      localStorage.setItem(KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn("Could not save document history to localStorage:", e);
      return null;
    }
  }
  return entry;
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function deleteHistoryItem(id) {
  const updated = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
