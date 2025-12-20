import rateLimit from "express-rate-limit";

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // more forgiving for normal browsing
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // prevents brute force
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // uploads are CPU-heavy (sharp)
  standardHeaders: true,
  legacyHeaders: false,
});
