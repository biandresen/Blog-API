/**
 *
 * @param {object} user
 * @returns the user without the password
 */
function removePwFromUser(user) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export default removePwFromUser;
