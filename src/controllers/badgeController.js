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
  const userId = Number(req.user?.id);
  const page = req.query.page;
  const limit = req.query.limit;

  const { items, total, meta } = await badgeService.getBadgeHistoryForUser(userId, { page, limit });

  return successResponse(res, 200, "Badge history retrieved", items, items.length, meta);
}



export default {
  getMyCurrentBadges,
  getMyBadgeHistory,
};
