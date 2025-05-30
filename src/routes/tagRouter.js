import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import tagController from "../controllers/tagController.js";
import newTagValidator from "../validation/newTagValidator.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import queryParametersValidator from "../validation/queryParametersValidator.js";
import checkValidation from "../middleware/checkValidation.js";

const router = Router();

router.get("/popular", asyncErrorHandler(tagController.getPopularTags));

router.get("/", queryParametersValidator, asyncErrorHandler(tagController.getAllTags));

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

router.post(
  "/",
  isAuthenticated,
  newTagValidator,
  checkValidation,
  asyncErrorHandler(tagController.createTag)
);

export default router;
