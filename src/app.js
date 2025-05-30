// PACKAGE IMPORTS
import express from "express";
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

const app = express();

// app.set("trust proxy", true); //If behind a proxy (e.g., Vercel, Nginx)

// SECURITY HEADERS
app.use(helmet());

// RATE LIMITING (set early to block excessive traffic ASAP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true, // return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // disable `X-RateLimit-*` headers
});
app.use("/api", limiter); // Apply only to API routes (optional)

// LOGGING
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// BODY PARSERS
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// DATA SANITIZATION
// app.use(xss()); // Prevent XSS
app.use(hpp()); // Prevent HTTP parameter pollution

// CORS
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  })
);

// COMPRESSION
app.use(compression());

// ROUTES
app.use("/api/v1/auth", routes.authRouter);
app.use("/api/v1/user", routes.userRouter);
app.use("/api/v1/posts", routes.postRouter);
app.use("/api/v1/comments", routes.commentRouter);
app.use("/api/v1/tags", routes.tagRouter);

// UNHANDLED ROUTES
app.all("/*b", (req, res, next) => {
  next(new CustomError(404, `Can't find ${req.originalUrl} on this server!`));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
