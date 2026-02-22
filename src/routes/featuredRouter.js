import { Router } from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import postService from "../services/postService.js";
import successResponse from "../utils/successResponse.js";
import * as featuredService from "../services/featuredService.js"

const router = Router();

router.post(
  "/top-creator-month",
  // "/admin/recompute/top-creator-month",
  // isAuthenticated,
  // isAdmin,
  asyncErrorHandler(async (req, res) => {
    const postId = await featuredService.computeTopCreatorThisMonth();
    return successResponse(res, 200, "Top creator computed", { postId });
  })
);

router.post(
  "/most-commented-week",
  // isAuthenticated,
  // isAdmin,
  asyncErrorHandler(async (req, res) => {
    console.log("test")
    const postId = await postService.computeMostCommentedThisWeek();
    return successResponse(res, 200, "Most commented week computed", { postId });
  })
);

router.post(
  "/trending-week",
  // isAuthenticated,
  // isAdmin,
  asyncErrorHandler(async (req, res) => {
    const postId = await postService.computeTrendingThisWeek();
    return successResponse(res, 200, "Trending week computed", { postId });
  })
);

router.post(
  "/fastest-growing",
  // isAuthenticated,
  // isAdmin,
  asyncErrorHandler(async (req, res) => {
    const postId = await postService.computeFastestGrowing24h();
    return successResponse(res, 200, "Fastest growing computed", { postId });
  })
);

export default router