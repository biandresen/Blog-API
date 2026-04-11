import crypto from "crypto";
import authService from "../services/authService.js";
import emailService from "../services/emailService.js";

export default async function sendEmailVerificationFlow(user, req) {
  const FRONTEND_BASE_URL = process.env.NODE_ENV == "production" ? process.env.FRONTEND_BASE_URL || "https://pundad.app" : "http://localhost:5173";

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const issuedAt = new Date();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await authService.storeEmailVerificationToken(user.id, {
    token: hashedToken,
    issuedAt,
    expiresAt,
    userAgent: req.headers["user-agent"] || null,
    ipAddress: req.ip,
  });

  const verificationUrl = `${FRONTEND_BASE_URL}/verify-email/${rawToken}`;

  await emailService.sendVerificationEmail(user.email, verificationUrl, req.language);
}