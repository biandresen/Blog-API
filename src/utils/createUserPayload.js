/**
 * Extracts safe and necessary user info to include in JWT tokens.
 *
 * @param {Object} user - Full user object from database.
 * @param {string|number} user.id - User ID.
 * @param {string} user.username - Username.
 * @param {string} user.email - User email.
 * @param {string} [user.role] - User role (optional).
 * @returns {{ id: string|number, username: string, email: string, role?: string }} Token-safe user payload.
 */

function createUserPayload(user) {
  return { id: user.id, username: user.username, email: user.email, role: user.role };
}

export default createUserPayload;
