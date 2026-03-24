import { matchedData } from "express-validator";
import CustomError from "../utils/CustomError.js";
import successResponse from "../utils/successResponse.js";
import moderationService from "../services/moderationService.js";
import logService from "../services/logService.js";

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

    await logService.createAuditLog({
      actorUserId: req.user?.id ?? null,
      action: "MODERATION_TERM_CREATED",
      entityType: "ModerationTerm",
      entityId: String(created.id),
      summary: `Moderation term created: ${created.term}`,
      diff: {
        after: {
          term: created.term,
          category: created.category,
          isActive: created.isActive,
          notes: created.notes,
        },
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || null,
    });

    return successResponse(res, 201, "Moderation term created", created, 1);
  } catch (error) {
    if (error.message === "Moderation term already exists") {
      return next(
        new CustomError(409, "Moderation term already exists", [
          { field: "term", message: "This moderation term already exists" },
        ])
      );
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

  const existing = await moderationService.getModerationTermById(id);
  if (!existing) {
    return next(new CustomError(404, "Moderation term not found"));
  }

  try {
    const updated = await moderationService.updateModerationTerm(id, {
      term,
      category,
      isActive,
    });

    await logService.createAuditLog({
      actorUserId: req.user?.id ?? null,
      action: "MODERATION_TERM_UPDATED",
      entityType: "ModerationTerm",
      entityId: String(updated.id),
      summary: `Moderation term updated: ${updated.term}`,
      diff: {
        before: {
          term: existing.term,
          category: existing.category,
          isActive: existing.isActive,
          notes: existing.notes,
        },
        after: {
          term: updated.term,
          category: updated.category,
          isActive: updated.isActive,
          notes: updated.notes,
        },
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || null,
    });

    return successResponse(res, 200, "Moderation term updated", updated, 1);
  } catch (error) {
    if (error.message === "Moderation term already exists") {
      return next(
        new CustomError(409, "Moderation term already exists", [
          { field: "term", message: "This moderation term already exists" },
        ])
      );
    }

    throw error;
  }
}

async function deleteTerm(req, res, next) {
  const { id } = matchedData(req);

  const existing = await moderationService.getModerationTermById(id);
  if (!existing) {
    return next(new CustomError(404, "Moderation term not found"));
  }

  const deleted = await moderationService.deleteModerationTerm(id);

  await logService.createAuditLog({
    actorUserId: req.user?.id ?? null,
    action: "MODERATION_TERM_DEACTIVATED",
    entityType: "ModerationTerm",
    entityId: String(existing.id),
    summary: `Moderation term deleted/deactivated: ${existing.term}`,
    diff: {
      before: {
        term: existing.term,
        category: existing.category,
        isActive: existing.isActive,
        notes: existing.notes,
      },
      after: {
        term: deleted?.term ?? existing.term,
        category: deleted?.category ?? existing.category,
        isActive: deleted?.isActive ?? false,
        notes: deleted?.notes ?? existing.notes,
      },
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || null,
  });

  return successResponse(res, 200, "Moderation term deleted");
}

async function reloadTerms(req, res, next) {
  const terms = await moderationService.loadModerationTerms();

  await logService.createAuditLog({
    actorUserId: req.user?.id ?? null,
    action: "MODERATION_CACHE_RELOADED",
    entityType: "ModerationCache",
    entityId: null,
    summary: "Moderation cache reloaded",
    diff: {
      count: terms.length,
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || null,
  });

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
  getPublicTerms,
};