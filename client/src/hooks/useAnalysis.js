import { useState, useCallback, useRef } from "react";
import { useDocument } from "./useDocument.js";
import { analyzeDocument } from "../api/documents.js";

export function useAnalysis() {
  const { text, analyses, cacheAnalysis } = useDocument();
  const [loadingKeys, setLoadingKeys] = useState({});
  const [errors, setErrors] = useState({});
  const inFlight = useRef({}); // prevent duplicate concurrent requests

  const getCacheKey = (analysisType, options = {}) =>
    analysisType + (options.style ? `:${options.style}` : "");

  const getCached = useCallback(
    (analysisType, options = {}) => analyses[getCacheKey(analysisType, options)] || null,
    [analyses]
  );

  const isLoading = useCallback(
    (analysisType, options = {}) => !!loadingKeys[getCacheKey(analysisType, options)],
    [loadingKeys]
  );

  const getError = useCallback(
    (analysisType, options = {}) => errors[getCacheKey(analysisType, options)] || null,
    [errors]
  );

  const analyze = useCallback(
    async (analysisType, options = {}, force = false) => {
      if (!text) return null;
      const key = getCacheKey(analysisType, options);

      // Return cached result if available and not forced
      if (!force && analyses[key]) return analyses[key];

      // Prevent duplicate in-flight requests for the same key
      if (inFlight.current[key]) return inFlight.current[key];

      setLoadingKeys((prev) => ({ ...prev, [key]: true }));
      setErrors((prev) => ({ ...prev, [key]: null }));

      const promise = analyzeDocument(text, analysisType, options)
        .then((result) => {
          cacheAnalysis(key, result);
          setErrors((prev) => ({ ...prev, [key]: null }));
          return result;
        })
        .catch((err) => {
          setErrors((prev) => ({ ...prev, [key]: err.message }));
          return null;
        })
        .finally(() => {
          delete inFlight.current[key];
          setLoadingKeys((prev) => ({ ...prev, [key]: false }));
        });

      inFlight.current[key] = promise;
      return promise;
    },
    [text, analyses, cacheAnalysis]
  );

  return { analyze, getCached, isLoading, getError };
}
