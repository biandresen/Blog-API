import prisma from "../config/prismaClient.js";

async function getUserByUsername(username) {
  return await prisma.user.findFirst({ where: { username } });
}

async function getUserByEmail(email) {
  return await prisma.user.findFirst({ where: { email } });
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

export default {
  getUserByUsername,
  getUserByEmail,
  createUser,
};
