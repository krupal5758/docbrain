export function errorHandler(err, req, res, next) {
  console.error("[Error]", err.message);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: { message: "File too large. Maximum size is 10MB.", code: "FILE_TOO_LARGE" },
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      error: { message: "Unexpected file field.", code: "UNEXPECTED_FILE" },
    });
  }

  // Validation errors
  if (err.status === 400) {
    return res.status(400).json({
      error: { message: err.message, code: "VALIDATION_ERROR" },
    });
  }

  res.status(err.status || 500).json({
    error: {
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
      code: "INTERNAL_ERROR",
    },
  });
}
