import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getSummaryPrompt,
  getEntityPrompt,
  getQuestionsPrompt,
  getSentimentPrompt,
  getConceptMapPrompt,
} from "./prompts.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Primary + fallback model chain (all confirmed available on this key)
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"];

const MAX_TOKENS_BY_TYPE = {
  summary: 1024,
  entities: 4096,
  questions: 4096,
  sentiment: 1024,
  conceptMap: 2048,
};

export function parseJson(raw) {
  const clean = (typeof raw === "string" ? raw : "").trim();

  // 1. Direct parse
  try { return JSON.parse(clean); } catch {}

  // 2. Strip markdown code fences
  const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch {}
  }

  // 3. Find the first outermost { ... } or [ ... ] block
  for (const [open, close] of [["{", "}"], ["[", "]"]]) {
    const start = clean.indexOf(open);
    const end = clean.lastIndexOf(close);
    if (start !== -1 && end > start) {
      try { return JSON.parse(clean.slice(start, end + 1)); } catch {}
    }
  }

  throw new Error("Model returned non-JSON output. Please try again.");
}

// Retry with exponential backoff — handles 503 overload
async function withRetry(fn, maxAttempts = 3) {
  let lastErr;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err.message || "";
      const isRetryable =
        msg.includes("503") ||
        msg.includes("529") ||
        msg.includes("overloaded") ||
        msg.includes("Service Unavailable");
      if (!isRetryable || attempt === maxAttempts - 1) throw err;
      const delay = (attempt + 1) * 1500; // 1.5s, 3s
      await new Promise((r) => setTimeout(r, delay));
      console.log(`[retry] attempt ${attempt + 2}/${maxAttempts} after ${delay}ms`);
    }
  }
  throw lastErr;
}

function buildPrompt(analysisType, text, options) {
  switch (analysisType) {
    case "summary":    return getSummaryPrompt(text, options.style || "executive");
    case "entities":   return getEntityPrompt(text);
    case "questions":  return getQuestionsPrompt(text);
    case "sentiment":  return getSentimentPrompt(text);
    case "conceptMap": return getConceptMapPrompt(text);
    default: throw new Error(`Unknown analysisType: ${analysisType}`);
  }
}

function getModel(modelName, maxOutputTokens) {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens,
      temperature: 0.1,          // Low temp = consistent JSON output
      responseMimeType: "application/json",
      // Disable thinking to prevent text leaking before JSON
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
}

export async function analyzeDocument(text, analysisType, options = {}) {
  const { system, userMessage } = buildPrompt(analysisType, text, options);
  const maxTokens = MAX_TOKENS_BY_TYPE[analysisType] || 2048;

  // Try each model in order until one works
  let lastErr;
  for (const modelName of MODELS) {
    try {
      const result = await withRetry(async () => {
        const model = getModel(modelName, maxTokens);
        const res = await model.generateContent({
          systemInstruction: system,
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        });
        return res;
      });
      const raw = result.response.text();
      return parseJson(raw);
    } catch (err) {
      lastErr = err;
      const msg = err.message || "";
      // Only try next model on overload/unavailable errors
      const tryNext =
        msg.includes("503") ||
        msg.includes("404") ||
        msg.includes("overloaded") ||
        msg.includes("not found");
      if (!tryNext) throw err;
      console.log(`[model-fallback] ${modelName} failed, trying next...`);
    }
  }
  throw lastErr;
}

export async function* streamChat(text, question, history) {
  const systemPrompt = `You are a knowledgeable assistant helping a user understand a document they uploaded.
Answer questions based ONLY on the document content provided. If the answer is not in the document, say so clearly.
Quote or reference relevant parts of the document when answering. Be concise but thorough.

Document:
${text.slice(0, 120_000)}`;

  let lastErr;
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.5,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const geminiHistory = history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history: geminiHistory });
      const streamResult = await chat.sendMessageStream(question);

      for await (const chunk of streamResult.stream) {
        const t = chunk.text();
        if (t) yield t;
      }
      return; // success — stop trying other models
    } catch (err) {
      lastErr = err;
      const msg = err.message || "";
      const tryNext = msg.includes("503") || msg.includes("404") || msg.includes("not found");
      if (!tryNext) throw err;
      console.log(`[chat-model-fallback] ${modelName} failed, trying next...`);
    }
  }
  throw lastErr;
}
