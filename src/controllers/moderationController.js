import { matchedData } from "express-validator";
import CustomError from "../utils/CustomError.js";
import successResponse from "../utils/successResponse.js";
import moderationService from "../services/moderationService.js";

async function getTerms(req, res, next) {
  const terms = await moderationService.getAllModerationTerms();

  return successResponse(
    res,
    200,
    "Moderation terms retrieved",
    terms,
    terms.length
  );
}

async function getCacheMeta(req, res, next) {
  const meta = moderationService.getModerationCacheMeta();

  return successResponse(
    res,
    200,
    "Moderation cache metadata retrieved",
    meta,
    1
  );
}

async function createTerm(req, res, next) {
  const { term, category, isActive } = matchedData(req);

  try {
    const created = await moderationService.createModerationTerm({
      term,
      category,
      isActive,
    });

    return successResponse(res, 201, "Moderation term created", created, 1);
  } catch (error) {
    if (error.message === "Moderation term already exists") {
      return next(new CustomError(409, "Moderation term already exists", [
        { field: "term", message: "This moderation term already exists" },
      ]));
    }

    throw error;
  }
}

async function updateTerm(req, res, next) {
  const { id, term, category, isActive } = matchedData(req);

  const hasNoChanges =
    term === undefined &&
    category === undefined &&
    isActive === undefined;

  if (hasNoChanges) {
    return next(new CustomError(400, "No moderation fields were provided"));
  }

  try {
    const updated = await moderationService.updateModerationTerm(id, {
      term,
      category,
      isActive,
    });

    if (!updated) {
      return next(new CustomError(404, "Moderation term not found"));
    }

    return successResponse(res, 200, "Moderation term updated", updated, 1);
  } catch (error) {
    if (error.message === "Moderation term already exists") {
      return next(new CustomError(409, "Moderation term already exists", [
        { field: "term", message: "This moderation term already exists" },
      ]));
    }

    throw error;
  }
}

async function deleteTerm(req, res, next) {
  const { id } = matchedData(req);

  const deleted = await moderationService.deleteModerationTerm(id);

  if (!deleted) {
    return next(new CustomError(404, "Moderation term not found"));
  }

  return successResponse(res, 200, "Moderation term deleted");
}

async function reloadTerms(req, res, next) {
  const terms = await moderationService.loadModerationTerms();

  return successResponse(
    res,
    200,
    "Moderation cache reloaded",
    {
      count: terms.length,
    },
    1
  );
}

async function getPublicTerms(req, res, next) {
  const terms = await moderationService.getPublicModerationTerms();

  return successResponse(
    res,
    200,
    "Public moderation terms retrieved",
    terms,
    terms.length
  );
}

export default {
  getTerms,
  getCacheMeta,
  createTerm,
  updateTerm,
  deleteTerm,
  reloadTerms,
  getPublicTerms
};