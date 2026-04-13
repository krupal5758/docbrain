import rateLimit from "express-rate-limit";

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: { message: "Too many upload requests. Please try again later.", code: "RATE_LIMITED" } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: { message: "Too many analysis requests. Please slow down.", code: "RATE_LIMITED" } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: { message: "Too many chat requests. Please slow down.", code: "RATE_LIMITED" } },
  standardHeaders: true,
  legacyHeaders: false,
});
