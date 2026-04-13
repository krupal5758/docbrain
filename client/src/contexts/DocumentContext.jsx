import { createContext, useContext, useState, useCallback } from "react";
import { uploadFile, uploadText } from "../api/documents.js";
import { saveToHistory } from "../utils/storage.js";

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const [state, setState] = useState({
    status: "idle", // idle | uploading | ready | analyzing
    text: null,
    metadata: null,
    error: null,
  });

  const [analyses, setAnalyses] = useState({});

  const setDocument = useCallback(async (source) => {
    setState((s) => ({ ...s, status: "uploading", error: null }));
    try {
      let result;
      if (source instanceof File) {
        result = await uploadFile(source);
      } else {
        result = await uploadText(source.text, source.filename);
      }
      setState({ status: "ready", text: result.text, metadata: result.metadata, error: null });
      setAnalyses({});
      saveToHistory(result);
    } catch (err) {
      setState((s) => ({ ...s, status: "idle", error: err.message }));
    }
  }, []);

  const clearDocument = useCallback(() => {
    setState({ status: "idle", text: null, metadata: null, error: null });
    setAnalyses({});
  }, []);

  const cacheAnalysis = useCallback((type, result) => {
    setAnalyses((prev) => ({ ...prev, [type]: result }));
  }, []);

  return (
    <DocumentContext.Provider
      value={{ ...state, analyses, setDocument, clearDocument, cacheAnalysis }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocumentContext must be used within DocumentProvider");
  return ctx;
}
