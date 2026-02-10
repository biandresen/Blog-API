import rateLimit from "express-rate-limit";

const headers = { standardHeaders: true, legacyHeaders: false };

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  ...headers,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  ...headers,
});

// Tighter for account creation spam
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                  // 5 accounts/hour/IP
  ...headers,
  message: { message: "Too many accounts created from this IP. Try again later." },
});

// Optional: even tighter on password reset endpoints
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  ...headers,
  message: { message: "Too many password reset attempts. Try again later." },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  ...headers,
});
