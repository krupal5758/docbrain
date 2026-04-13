import express from "express";
import { streamChat } from "../services/claude.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  const { text, question, history = [] } = req.body;

  if (!text || !question) {
    return res.status(400).json({
      error: { message: "text and question are required.", code: "MISSING_FIELDS" },
    });
  }

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
      res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
    }
  } finally {
    res.end();
  }
});

export default router;
