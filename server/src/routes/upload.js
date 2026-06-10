import express from "express";
import multer from "multer";
import { parseDocument } from "../services/parser.js";

const router = express.Router();

const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(req, file, cb) {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error("Only PDF, DOCX, and TXT files are supported."), { status: 400 }));
    }
  },
});

// POST /api/upload — accepts file (multipart) or { text, filename } (JSON)
router.post("/", (req, res, next) => {
  const contentType = req.headers["content-type"] || "";

  if (contentType.includes("multipart/form-data")) {
    upload.single("file")(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) {
        return res.status(400).json({ error: { message: "No file provided.", code: "NO_FILE" } });
      }

      try {
        const result = await parseDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
        res.json(result);
      } catch (parseErr) {
        next(parseErr);
      }
    });
  } else {
    // JSON body — pasted text
    const { text } = req.body;
    // Sanitize the client-supplied filename: it's echoed back in metadata and
    // later stored/displayed by the frontend, so strip path separators and
    // control characters and cap the length.
    const rawFilename = typeof req.body.filename === "string" ? req.body.filename : "";
    const filename =
      rawFilename.replace(/[/\\]/g, "_").replace(/[\x00-\x1f]/g, "").trim().slice(0, 255) ||
      "pasted-text.txt";

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: { message: "text field is required.", code: "MISSING_TEXT" } });
    }

    if (text.length > 400_000) {
      return res.status(400).json({
        error: { message: "Text is too long (max 400,000 characters).", code: "TEXT_TOO_LONG" },
      });
    }

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    res.json({
      text: text.trim(),
      metadata: { wordCount, charCount: text.length, fileName: filename, mimeType: "text/plain" },
    });
  }
});

export default router;
