/**
 *
 * @param {object} user
 * @returns only safe and necessary info about the user
 */
function createUserPayload(user) {
  return { id: user.id, username: user.username, email: user.email, role: user.role };
}

export default createUserPayload;
