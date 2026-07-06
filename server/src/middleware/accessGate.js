// Optional access gate: set ACCESS_CODE in the environment to require a shared
// code on every API request. Left unset, the API stays open (local dev).
// Protects a public deployment from having its Gemini quota drained.
export function accessGate(req, res, next) {
  const code = process.env.ACCESS_CODE;
  if (!code) return next();

  if (req.headers["x-access-code"] === code) return next();

  res.status(401).json({
    error: { message: "Access code required.", code: "ACCESS_CODE_REQUIRED" },
  });
}
