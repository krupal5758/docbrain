import express from "express";
import { analyzeDocument } from "../services/claude.js";
import { validateAnalysisInput } from "../middleware/validation.js";

const router = express.Router();

router.post("/", validateAnalysisInput, async (req, res, next) => {
  const { text, analysisType, options = {} } = req.body;

  try {
    const result = await analyzeDocument(text, analysisType, options);
    res.json(result);
  } catch (err) {
    console.error("[analyze error]", err.message, err.status, JSON.stringify(err));
    if (err.status === 429 || err.message?.includes("429") || err.message?.includes("quota")) {
      return res.status(429).json({
        error: { message: "API rate limit reached. Please wait a moment.", code: "RATE_LIMITED" },
      });
    }
    if (err.status === 401 || err.status === 403 || err.message?.includes("API key")) {
      return res.status(500).json({
        error: { message: "Invalid API key. Please check your GEMINI_API_KEY in server/.env", code: "INVALID_API_KEY" },
      });
    }
    next(err);
  }
});

export default router;
