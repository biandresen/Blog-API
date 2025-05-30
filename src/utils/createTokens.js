import createUserPayload from "./createUserPayload.js";
import jwt from "jsonwebtoken";

/**
 * Generates access and refresh JSON Web Tokens (JWT) for a given user.
 *
 * @param {Object} user - The user object (e.g., from database) used to create token payload.
 * @param {string|number} user.id - The unique identifier of the user.
 * @param {string} user.username - The username of the user.
 * @param {string} [user.role] - Optional role or permission level of the user.
 *
 * @returns {{ accessToken: string, refreshToken: string }} An object containing the signed access and refresh tokens.
 */

function createTokens(user) {
  const tokenPayload = createUserPayload(user); // Extract only what's needed
  return {
    accessToken: jwt.sign(tokenPayload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" }),
    refreshToken: jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" }),
  };
}

export default createTokens;
