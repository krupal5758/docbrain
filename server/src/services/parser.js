import mammoth from "mammoth";

export async function parseDocument(buffer, mimetype, originalname) {
  const mimeMap = {
    "application/pdf": parsePdf,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": parseDocx,
    "text/plain": parseTxt,
  };

  const parser = mimeMap[mimetype];
  if (!parser) {
    throw Object.assign(new Error(`Unsupported file type: ${mimetype}`), { status: 400 });
  }

  const { text, metadata } = await parser(buffer);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return {
    text: text.trim(),
    metadata: {
      ...metadata,
      wordCount,
      charCount,
      fileName: originalname,
      mimeType: mimetype,
    },
  };
}

async function parsePdf(buffer) {
  // Dynamic import to avoid pdf-parse test file issue on module load
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    metadata: {
      pages: data.numpages,
      info: data.info,
    },
  };
}

async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    metadata: {},
  };
}

async function parseTxt(buffer) {
  return {
    text: buffer.toString("utf-8"),
    metadata: {},
  };
}
