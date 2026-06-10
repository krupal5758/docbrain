import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uploadRouter from "./routes/upload.js";
import analyzeRouter from "./routes/analyze.js";
import chatRouter from "./routes/chat.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { uploadLimiter, analyzeLimiter, chatLimiter } from "./middleware/rateLimiter.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fail fast on missing required config instead of crashing on the first API call.
if (!process.env.GEMINI_API_KEY) {
  console.error(
    "[config] GEMINI_API_KEY is not set. Add it to server/.env before starting."
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

app.use(helmet({ contentSecurityPolicy: isProd }));
const devOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",")
  : ["http://localhost:5173", "http://127.0.0.1:5173"];
app.use(
  cors({
    origin: isProd ? false : devOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/upload", uploadLimiter, uploadRouter);
app.use("/api/analyze", analyzeLimiter, analyzeRouter);
app.use("/api/chat", chatLimiter, chatRouter);

// Serve built frontend in production
if (isProd) {
  const publicDir = join(__dirname, "../../public");
  app.use(express.static(publicDir));
  app.get("*", (req, res) => {
    res.sendFile(join(publicDir, "index.html"));
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`DocBrain server running on http://localhost:${PORT}`);
});
