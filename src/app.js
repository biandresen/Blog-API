import express from "express";
import path from "path";
import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
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



const app = express();

// ----------------------------
// SECURITY HEADERS (API routes only)
// ----------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow images from other origins
  })
);

// ----------------------------
// RATE LIMITING
// ----------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", generalApiLimiter);

// ----------------------------
// LOGGING
// ----------------------------
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ----------------------------
// BODY PARSERS
// ----------------------------
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ----------------------------
// DATA SANITIZATION
// ----------------------------
app.use(hpp());

// ----------------------------
// CORS (API routes)
// ----------------------------
const allowedOrigins = new Set(CORS_ORIGINS);

app.use("/api", cors({
  origin: (origin, cb) => {
    // allow non-browser clients (curl/postman) with no Origin header
    if (!origin) return cb(null, true);

    if (allowedOrigins.has(origin)) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  credentials: true,
}));

// ----------------------------
// SERVE UPLOADS (Static Files)
// ----------------------------
// Serve uploads (avatars) safely for cross-origin

const uploadsPath = path.join(process.cwd(), "uploads");

app.use("/uploads", express.static(uploadsPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res) => {
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    // For avatars to be embeddable on other origins, use:
    // res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
}));


// ----------------------------
// COMPRESSION
// ----------------------------
app.use(compression());

// ----------------------------
// ROUTES
// ----------------------------
app.use("/api/v1/auth", routes.authRouter);
app.use("/api/v1/user", routes.userRouter);
app.use("/api/v1/posts", routes.postRouter);
app.use("/api/v1/comments", routes.commentRouter);
app.use("/api/v1/tags", routes.tagRouter);
app.use("/api/v1/badges", routes.badgeRouter);
app.use("/api/v1/featured", routes.featuredRouter);

// ----------------------------
// UNHANDLED ROUTES
// ----------------------------
app.all("/*b", (req, res, next) => {
  next(new CustomError(404, `Can't find ${req.originalUrl} on this server!`));
});

// ----------------------------
// GLOBAL ERROR HANDLER
// ----------------------------
app.use(globalErrorHandler);

export default app;
