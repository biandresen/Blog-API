import prisma from "../config/prismaClient.js";

async function getAllTags({ page = 1, limit = 20, sort = "name", sortOrder = "asc" } = {}) {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 20;
  const skip = (parsedPage - 1) * parsedLimit;

  // Only allow sorting by certain fields to prevent errors
  const validSortFields = ["name", "createdAt", "changedAt"];
  const sortField = validSortFields.includes(sort) ? sort : "name";
  const order = sortOrder.toLowerCase() === "desc" ? "desc" : "asc";

  return await prisma.tag.findMany({
    skip,
    take: parsedLimit,
    orderBy: {
      [sortField]: order,
    },
  });
}

export default {
  getAllTags,
};
