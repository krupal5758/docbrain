import { test, before, after } from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseJson } from "../src/services/claude.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3600 + Math.floor(Math.random() * 400);
const BASE = `http://127.0.0.1:${PORT}`;

let server;

function post(url, body) {
  return fetch(`${BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

before(async () => {
  server = spawn(process.execPath, [join(__dirname, "..", "src", "index.js")], {
    env: { ...process.env, PORT: String(PORT), GEMINI_API_KEY: "test-key-not-real", NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));

  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Server did not start");
});

after(() => {
  if (server) server.kill();
});

// ── parseJson unit tests ──────────────────────────────────────────────────────

test("parseJson handles raw JSON", () => {
  assert.deepStrictEqual(parseJson('{"a": 1}'), { a: 1 });
});

test("parseJson strips markdown code fences", () => {
  assert.deepStrictEqual(parseJson('```json\n{"a": 1}\n```'), { a: 1 });
});

test("parseJson extracts JSON embedded in prose", () => {
  assert.deepStrictEqual(parseJson('Here is the result: {"a": 1} hope that helps'), { a: 1 });
});

test("parseJson throws on non-JSON output", () => {
  assert.throws(() => parseJson("I cannot do that."), /non-JSON/);
});

// ── HTTP validation tests (no Gemini calls needed) ────────────────────────────

test("health check responds", async () => {
  const res = await fetch(`${BASE}/api/health`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, "ok");
});

test("upload accepts pasted text and counts words", async () => {
  const res = await post("/api/upload", { text: "hello brave new world", filename: "notes.txt" });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.metadata.wordCount, 4);
  assert.strictEqual(data.metadata.fileName, "notes.txt");
});

test("upload sanitizes path separators out of the filename", async () => {
  const res = await post("/api/upload", { text: "hi", filename: "../../etc/passwd" });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  // Path separators are the actual traversal risk; ".." without separators is inert.
  assert.ok(!data.metadata.fileName.includes("/"), `filename not sanitized: ${data.metadata.fileName}`);
  assert.ok(!data.metadata.fileName.includes("\\"), `filename not sanitized: ${data.metadata.fileName}`);
});

test("upload rejects missing and oversized text", async () => {
  const missing = await post("/api/upload", { filename: "x.txt" });
  assert.strictEqual(missing.status, 400);

  const huge = await post("/api/upload", { text: "x".repeat(400_001) });
  assert.strictEqual(huge.status, 400);
});

test("chat validates text and question", async () => {
  const noFields = await post("/api/chat", {});
  assert.strictEqual(noFields.status, 400);

  const blankQuestion = await post("/api/chat", { text: "doc", question: "   " });
  assert.strictEqual(blankQuestion.status, 400);

  const wrongTypes = await post("/api/chat", { text: 123, question: ["x"] });
  assert.strictEqual(wrongTypes.status, 400);

  const longQuestion = await post("/api/chat", { text: "doc", question: "q".repeat(4_001) });
  assert.strictEqual(longQuestion.status, 400);
});

test("analyze validates input without calling the model", async () => {
  const missing = await post("/api/analyze", {});
  assert.strictEqual(missing.status, 400);
});
