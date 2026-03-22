import express from "express";
import path from "path";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// INTERNAL IMPORTS
import CustomError from "./utils/CustomError.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import routes from "./routes/index.js";
import { CORS_ORIGINS } from "./constants.js";
import { generalApiLimiter } from "./middleware/rateLimiters.js";
import { languageMiddleware } from "./middleware/languageMiddleware.js";

const app = express();

/**
 * Use a Set for fast lookup when checking whether an origin is allowed.
 * This is cleaner and more efficient than repeatedly searching an array.
 */
const allowedOrigins = new Set(CORS_ORIGINS);

/**
 * Resolve the uploads directory once and reuse it.
 * process.cwd() keeps it relative to the project root at runtime.
 */
const uploadsPath = path.join(process.cwd(), "uploads");

// --------------------------------------------------
// 1) BASIC SECURITY HEADERS
// --------------------------------------------------
/**
 * helmet adds common security-related headers.
 *
 * crossOriginResourcePolicy is disabled here because the app serves images
 * that may need to be requested from a different frontend origin.
 * Static file headers for /uploads are configured more specifically below.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// --------------------------------------------------
// 2) DEVELOPMENT LOGGING
// --------------------------------------------------
/**
 * Only log request details in development to avoid noisy production logs.
 */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// --------------------------------------------------
// 3) CORS FOR API ROUTES
// --------------------------------------------------
/**
 * CORS must run BEFORE rate limiters and route handlers.
 *
 * Why:
 * - If a request is blocked by a limiter before CORS runs, the browser may
 *   not be allowed to read the real response.
 * - That often makes a real 429 look like a generic "network error" in Axios.
 *
 * credentials: true is needed because this app uses cookies/tokens in a way
 * that may require credentials on cross-origin requests.
 *
 * exposedHeaders: ["Retry-After"] allows the frontend to read that header
 * on rate-limited responses when needed.
 */
app.use(
  "/api",
  cors({
    origin: (origin, cb) => {
      // Allow non-browser tools like curl/Postman that send no Origin header.
      if (!origin) return cb(null, true);

      // Allow configured frontend origins.
      if (allowedOrigins.has(origin)) return cb(null, true);

      // Reject unknown origins with an operational app error.
      return cb(new CustomError(403, `CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    exposedHeaders: ["Retry-After"],
  })
);

// --------------------------------------------------
// 4) BODY PARSERS + COOKIES
// --------------------------------------------------
/**
 * Parse incoming JSON and form bodies with reasonable size limits.
 * Keeping limits small helps reduce abuse and accidental oversized payloads.
 */
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// --------------------------------------------------
// 5) REQUEST HARDENING / SANITIZATION
// --------------------------------------------------
/**
 * hpp helps protect against HTTP parameter pollution by removing duplicate
 * query string parameters unless explicitly allowed.
 */
app.use(hpp());

// --------------------------------------------------
// 6) RESPONSE COMPRESSION
// --------------------------------------------------
/**
 * Compress responses to reduce payload size and improve performance.
 * This is usually safe globally for API + text responses.
 */
app.use(compression());

// --------------------------------------------------
// 7) STATIC FILES
// --------------------------------------------------
/**
 * Serve uploaded files such as avatars.
 *
 * etag + lastModified help browser caching.
 *
 * Cross-Origin-Resource-Policy is set to "same-site" here for a safer default.
 * If you later need avatars/images to be embeddable from completely different
 * origins, you may switch to "cross-origin" after verifying the requirement.
 */
app.use(
  "/uploads",
  express.static(uploadsPath, {
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "same-site");
      // Alternative if cross-origin embedding is required:
      // res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// --------------------------------------------------
// 8) RATE LIMITING
// --------------------------------------------------
/**
 * Apply the general limiter after CORS, so the browser can still read
 * proper 429 responses and their JSON body.
 *
 * Route-specific limiters can still be added inside routers for sensitive
 * endpoints like login, register, password reset, uploads, etc.
 */
app.use("/api", generalApiLimiter);

// --------------------------------------------------
// 9) API-SPECIFIC MIDDLEWARE
// --------------------------------------------------
/**
 * Apply the language middleware to versioned API routes.
 * This keeps language logic centralized for the API layer.
 */
app.use("/api/v1", languageMiddleware);

// --------------------------------------------------
// 10) API ROUTES
// --------------------------------------------------
/**
 * Mount all feature routers here.
 * Keeping route registration together makes the app entry easier to scan.
 */
app.use("/api/v1/auth", routes.authRouter);
app.use("/api/v1/user", routes.userRouter);
app.use("/api/v1/posts", routes.postRouter);
app.use("/api/v1/comments", routes.commentRouter);
app.use("/api/v1/tags", routes.tagRouter);
app.use("/api/v1/badges", routes.badgeRouter);
app.use("/api/v1/featured", routes.featuredRouter);
app.use("/api/v1/hall-of-fame", routes.hallOfFameRouter);
app.use("/api/v1/moderation", routes.moderationRouter);

// --------------------------------------------------
// 11) UNHANDLED ROUTES
// --------------------------------------------------
/**
 * Any request that reaches this point did not match a route above.
 * Forward a standardized 404 error into the global error handler.
 *
 * Note:
 * app.all("*", ...) is the common pattern.
 * If "/*b" is intentional for your router setup, keep it as-is.
 * Otherwise, change it to "*" or "/*" depending on your Express version/setup.
 */
app.all("/*b", (req, res, next) => {
  next(new CustomError(404, `Can't find ${req.originalUrl} on this server!`));
});

// --------------------------------------------------
// 12) GLOBAL ERROR HANDLER
// --------------------------------------------------
/**
 * This must be registered last.
 * It handles all forwarded operational errors and unexpected server errors.
 */
app.use(globalErrorHandler);

export default app;