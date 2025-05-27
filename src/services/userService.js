import prisma from "../config/prismaClient.js";

async function getUserById(id) {
  return await prisma.user.findFirst({ where: { id, active: true } });
}

async function getUserByUsername(username) {
  return await prisma.user.findFirst({ where: { username, active: true } });
}

async function getUserByEmail(email) {
  return await prisma.user.findFirst({ where: { email, active: true } });
}

async function createUser(username, email, password) {
  return await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });
}

async function updateUser(userId, updateData = {}) {
  const fieldsToUpdate = {};

  if (updateData.username !== undefined) fieldsToUpdate.username = updateData.username;
  if (updateData.email !== undefined) fieldsToUpdate.email = updateData.email;
  if (updateData.password !== undefined) fieldsToUpdate.password = updateData.password;
  if (updateData.avatar !== undefined) fieldsToUpdate.avatar = updateData.avatar;

  return await prisma.user.update({
    where: { id: userId },
    data: fieldsToUpdate,
  });
}

async function changeRole(userId, role) {
  return await prisma.user.update({
    where: { id: userId },
    data: role,
  });
}

async function deleteUser(userId) {
  return await prisma.user.update({
    where: { id: userId },
    data: { active: false },
  });
}

async function reactivateUser(userId) {
  return await prisma.user.update({
    where: { id: userId },
    data: { active: true },
  });
}

export default {
  getUserById,
  getUserByUsername,
  getUserByEmail,
  createUser,
  updateUser,
  changeRole,
  deleteUser,
  reactivateUser,
};
