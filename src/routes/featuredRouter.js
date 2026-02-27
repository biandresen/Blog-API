import { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import successResponse from "../utils/successResponse.js";
import * as featuredService from "../services/featuredService.js";
import { FeatureType } from "@prisma/client";

const router = Router();

router.post(
  "/admin/recompute/top-creator-month",
  isAuthenticated,
  isAdmin,
  asyncErrorHandler(async (req, res) => {
    const postId = await featuredService.computeTopCreatorThisMonth();
    return successResponse(res, 200, "Top creator computed", { postId });
  })
);

router.post(
  "/admin/recompute/most-commented-week",
  isAuthenticated,
  isAdmin,
  asyncErrorHandler(async (req, res) => {
    const postId = await featuredService.computeMostCommentedThisWeek();
    return successResponse(res, 200, "Most commented week computed", { postId });
  })
);

router.post(
  "/admin/recompute/trending-week",
  isAuthenticated,
  isAdmin,
  asyncErrorHandler(async (req, res) => {
    const postId = await featuredService.computeTrendingThisWeek();
    return successResponse(res, 200, "Trending week computed", { postId });
  })
);

router.post(
  "/admin/recompute/fastest-growing",
  isAuthenticated,
  isAdmin,
  asyncErrorHandler(async (req, res) => {
    const postId = await featuredService.computeFastestGrowing24h();
    return successResponse(res, 200, "Fastest growing computed", { postId });
  })
);

// helper: map slug -> enum
const FEATURE_SLUG_MAP = {
  "joke-of-the-day": FeatureType.DAILY_JOKE,
  "trending-week": FeatureType.TRENDING_WEEK,
  "most-commented-week": FeatureType.MOST_COMMENTED_WEEK,
  "fastest-growing": FeatureType.FASTEST_GROWING,
  "top-creator-month": FeatureType.TOP_CREATOR_MONTH,
};

router.get(
  "/:slug",
  asyncErrorHandler(async (req, res) => {
    const slug = req.params.slug;
    const type = FEATURE_SLUG_MAP[slug];

    if (!type) {
      return successResponse(res, 200, "Unknown feature", null);
      // or throw CustomError(400, "Unknown feature")
    }

    const result = await featuredService.getCurrentFeatured(type);

    if (!result?.post) {
      return successResponse(res, 200, "No featured post yet", null);
    }

    return successResponse(res, 200, "Featured post retrieved", {
      type,
      date: result.date,
      post: result.post,
    });
  })
);

export default router;