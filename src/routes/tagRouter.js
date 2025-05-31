import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import tagController from "../controllers/tagController.js";
import newTagValidator from "../validation/newTagValidator.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import queryParametersValidator from "../validation/queryParametersValidator.js";
import checkValidation from "../middleware/checkValidation.js";

const router = Router();

router.get(
  "/popular",
  queryParametersValidator,
  checkValidation,
  asyncErrorHandler(tagController.getPopularTags)
);

router.get("/", queryParametersValidator, checkValidation, asyncErrorHandler(tagController.getAllTags));

router.post(
  "/",
  isAuthenticated,
  newTagValidator,
  checkValidation,
  asyncErrorHandler(tagController.createTag)
);

router.get("/:id", asyncErrorHandler(tagController.getTagById));

router.patch(
  "/:id",
  isAuthenticated,
  isAdmin,
  newTagValidator,
  checkValidation,
  asyncErrorHandler(tagController.editTag)
);

router.delete("/:id", isAuthenticated, isAdmin, asyncErrorHandler(tagController.deleteTag));

export default router;
