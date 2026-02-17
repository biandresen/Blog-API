import prisma from "../config/prismaClient.js";
import CustomError from "../utils/CustomError.js";
import successResponse from "../utils/successResponse.js";
import badgeService from "../services/badgeService.js";

async function getMyCurrentBadges(req, res, next) {
  const userId = Number(req.user?.id);
  if (isNaN(userId)) return next(new CustomError(401, "Unauthorized"));

  const badges = await prisma.currentUserBadge.findMany({
    where: { userId },
    orderBy: { since: "desc" },
  });

  return successResponse(res, 200, "Current badges retrieved", badges, badges.length);
}

async function getMyBadgeHistory(req, res, next) {
  const currentUser = req.user;
  if (!currentUser?.id) return next(new CustomError(401, "Unauthorized. Please log in."));

  const userId = Number(currentUser.id);
  if (Number.isNaN(userId)) return next(new CustomError(400, "Invalid user id"));

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 50);

  const { items, count } = await badgeService.getBadgeHistoryForUser(userId, { page, limit });

  return successResponse(res, 200, "Badge history retrieved", items, count);
}


export default {
  getMyCurrentBadges,
  getMyBadgeHistory,
};
