const MAX_TEXT_LENGTH = 400_000; // ~100K tokens

export function validateTextInput(req, res, next) {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({
      error: { message: "text field is required.", code: "MISSING_TEXT" },
    });
  }

  if (text.trim().length === 0) {
    return res.status(400).json({
      error: { message: "Text cannot be empty.", code: "EMPTY_TEXT" },
    });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      error: {
        message: `Document exceeds maximum length (${MAX_TEXT_LENGTH.toLocaleString()} characters). Please shorten it.`,
        code: "TEXT_TOO_LONG",
      },
    });
  }

  next();
}

export function validateAnalysisInput(req, res, next) {
  const { text, analysisType } = req.body;
  const validTypes = ["summary", "entities", "questions", "sentiment", "conceptMap"];

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({
      error: { message: "text field is required.", code: "MISSING_TEXT" },
    });
  }

  if (!analysisType || !validTypes.includes(analysisType)) {
    return res.status(400).json({
      error: {
        message: `analysisType must be one of: ${validTypes.join(", ")}`,
        code: "INVALID_ANALYSIS_TYPE",
      },
    });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      error: {
        message: `Document exceeds maximum length. Please use a shorter document.`,
        code: "TEXT_TOO_LONG",
      },
    });
  }

  next();
}
