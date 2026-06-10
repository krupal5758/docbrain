import express from "express";
import { streamChat } from "../services/claude.js";

const router = express.Router();

const MAX_TEXT_LENGTH = 400_000;
const MAX_QUESTION_LENGTH = 4_000;

// Normalize a client-supplied history array into well-formed { role, content }
// pairs. Drops anything malformed so a bad item can't crash the LLM mapping.
function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m) =>
        m &&
        typeof m === "object" &&
        typeof m.role === "string" &&
        typeof m.content === "string"
    )
    .map((m) => ({ role: m.role, content: m.content }));
}

router.post("/", async (req, res, next) => {
  const { text, question } = req.body;

  if (typeof text !== "string" || typeof question !== "string" || !text.trim() || !question.trim()) {
    return res.status(400).json({
      error: { message: "text and question are required.", code: "MISSING_FIELDS" },
    });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      error: { message: "Text is too long (max 400,000 characters).", code: "TEXT_TOO_LONG" },
    });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return res.status(400).json({
      error: { message: "Question is too long (max 4,000 characters).", code: "QUESTION_TOO_LONG" },
    });
  }

  const history = sanitizeHistory(req.body.history);

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let aborted = false;
  req.on("close", () => { aborted = true; });

  try {
    for await (const chunk of streamChat(text, question, history)) {
      if (aborted) break;
      res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
    }
    if (!aborted) {
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    }
  } catch (err) {
    console.error("[Chat error]", err.message);
    if (!aborted) {
      // Don't leak internal error details (stack traces, upstream messages) to clients.
      res.write(
        `data: ${JSON.stringify({ type: "error", message: "Something went wrong while generating a response. Please try again." })}\n\n`
      );
    }
  } finally {
    res.end();
  }
});

export default router;
