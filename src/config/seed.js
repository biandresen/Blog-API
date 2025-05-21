import prisma from "./prismaClient.js";

async function seed() {
  try {
    await prisma.user.create({
      data: {
        username: "User1",
        email: "user@user.com",
        password: "test123",
        active: true,
        role: "USER",
      },
    });
  } catch (err) {
    console.log(err);
  }
}

seed();
