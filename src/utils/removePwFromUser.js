/**
 * Removes the password field from a user object.
 *
 * @param {Object} user - The full user object including password.
 * @returns {Object} User object without the password.
 */

function removePwFromUser(user) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export default removePwFromUser;
