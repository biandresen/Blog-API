import prisma from "../config/prismaClient.js";

async function getAllTags({ page = 1, limit = 20, sort = "asc", sortType = "name" } = {}) {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 20;
  const skip = (parsedPage - 1) * parsedLimit;

  // Only allow sorting by certain fields to prevent errors
  const validSortFields = ["name", "createdAt", "changedAt"];
  const sortField = validSortFields.includes(sortType) ? sortType : "name";
  const order = sort.toLowerCase() === "desc" ? "desc" : "asc";

  return await prisma.tag.findMany({
    skip,
    take: parsedLimit,
    orderBy: {
      [sortField]: order,
    },
  });
}

async function getTagById(tagId) {
  return await prisma.tag.findUnique({
    where: { id: tagId },
  });
}

async function getTagByName(tagName) {
  return await prisma.tag.findUnique({
    where: { name: tagName },
  });
}

async function createTag(tagName) {
  tagName = tagName.toLowerCase();

  return await prisma.tag.create({
    data: {
      name: tagName,
    },
  });
}

async function updateTag(tagId, tagName) {
  tagName = tagName.toLowerCase();

  return await prisma.tag.update({
    where: { id: tagId },
    data: {
      name: tagName,
    },
  });
}

async function deleteTag(tagId) {
  return await prisma.tag.delete({
    where: { id: tagId },
  });
}

async function getPopularTags(limit = 10) {
  return await prisma.tag.findMany({
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
    take: limit,
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
}

export default {
  getAllTags,
  getTagById,
  getTagByName,
  createTag,
  updateTag,
  deleteTag,
  getPopularTags,
};
