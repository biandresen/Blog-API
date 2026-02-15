import prisma from "../config/prismaClient.js";

async function getUserById(id) {
  return await prisma.user.findFirst({ where: { id, active: true } });
}

async function getUserByUsername(username) {
  console.log(username);
  return await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });
}

async function getUserByEmail(email) {
  return await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });
}

async function createUser(username, email, password, meta = {}) {
  return prisma.user.create({
    data: {
      username,
      email,
      password,
      termsAcceptedAt: meta.termsAcceptedAt ?? null,
      termsVersion: meta.termsVersion ?? null,
      ...meta, // optional additional fields
    },
  });
}


async function updateUser(userId, updateData = {}) {
  const fieldsToUpdate = {};

  if (updateData.username !== undefined) fieldsToUpdate.username = updateData.username;
  if (updateData.email !== undefined) fieldsToUpdate.email = updateData.email;
  if (updateData.password !== undefined) fieldsToUpdate.password = updateData.password;
  if (updateData.avatar !== undefined) fieldsToUpdate.avatar = updateData.avatar;
  if (updateData.dailyJokeStreak !== undefined) fieldsToUpdate.dailyJokeStreak = updateData.dailyJokeStreak;
  if (updateData.dailyJokeBestStreak !== undefined) fieldsToUpdate.dailyJokeBestStreak = updateData.dailyJokeBestStreak;
  if (updateData.dailyJokeLastViewedAt !== undefined) fieldsToUpdate.dailyJokeLastViewedAt = updateData.dailyJokeLastViewedAt;


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
  return prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      active: false,
    },
  });
}

async function reactivateUser(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: null,
      active: true,
    },
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
