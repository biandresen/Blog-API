import prisma from "../config/prismaClient.js";

async function storeRefreshToken(userId, { token, issuedAt, expiresAt, userAgent, ipAddress }) {
  // 1. Delete any existing token for this user-agent
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      userAgent,
    },
  });

  // 2. Get all current tokens for the user
  const tokens = await prisma.refreshToken.findMany({
    where: { userId },
    orderBy: { issuedAt: "asc" },
  });

  // 3. If more than 4 exist, remove the oldest to stay under 5
  if (tokens.length >= 5) {
    await prisma.refreshToken.delete({
      where: { id: tokens[0].id },
    });
  }

  // 4. Create new token
  return await prisma.refreshToken.create({
    data: {
      userId,
      token,
      issuedAt,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });
  // Allows max 5 refresh tokens per user.
  // Ensures 1 active token per device (userAgent).
  // Cleans up oldest token if over the limit.
  // Prevents duplicates per device.
}

export default {
  storeRefreshToken,
};
