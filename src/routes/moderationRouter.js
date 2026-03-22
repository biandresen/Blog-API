import { Router } from "express";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import moderationController from "../controllers/moderationController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import checkValidation from "../middleware/checkValidation.js";
import idParamValidator from "../validation/idParamValidator.js";
import moderationTermCreateValidator from "../validation/moderationTermCreateValidator.js";
import moderationTermUpdateValidator from "../validation/moderationTermUpdateValidator.js";

const router = Router();

router.get(
  "/",
  isAuthenticated,
  isAdmin,
  asyncErrorHandler(moderationController.getTerms)
);

router.get(
  "/cache",
  isAuthenticated,
  isAdmin,
  asyncErrorHandler(moderationController.getCacheMeta)
);

router.get("/public-terms", asyncErrorHandler(moderationController.getPublicTerms));

router.post(
  "/",
  isAuthenticated,
  isAdmin,
  moderationTermCreateValidator,
  checkValidation,
  asyncErrorHandler(moderationController.createTerm)
);

router.patch(
  "/:id",
  isAuthenticated,
  isAdmin,
  idParamValidator,
  moderationTermUpdateValidator,
  checkValidation,
  asyncErrorHandler(moderationController.updateTerm)
);

router.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  idParamValidator,
  checkValidation,
  asyncErrorHandler(moderationController.deleteTerm)
);

router.post(
  "/reload",
  isAuthenticated,
  isAdmin,
  asyncErrorHandler(moderationController.reloadTerms)
);



export default router;