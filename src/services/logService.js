import prisma from "../config/prismaClient.js";
import logger from "../config/logger.js";

function safePreview(value, maxLength = 160) {
  if (!value || typeof value !== "string") return null;
  return value.slice(0, maxLength);
}

async function createModerationEvent({
  userId = null,
  action,
  blocked = true,
  fieldNames = [],
  matchedTerms = [],
  matchedVariants = [],
  contentPreview = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    return await prisma.moderationEvent.create({
      data: {
        userId,
        action,
        blocked,
        fieldNames,
        matchedTerms,
        matchedVariants,
        contentPreview: safePreview(contentPreview),
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    logger.error(
      {
        event: "moderation_event_log_failed",
        userId,
        action,
        err: {
          name: error.name,
          message: error.message,
        },
      },
      "Failed to persist moderation event"
    );
    return null;
  }
}

async function createAuditLog({
  actorUserId = null,
  targetUserId = null,
  action,
  entityType,
  entityId = null,
  summary,
  diff = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorUserId,
        targetUserId,
        action,
        entityType,
        entityId,
        summary,
        diff,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    logger.error(
      {
        event: "audit_log_failed",
        actorUserId,
        targetUserId,
        action,
        entityType,
        entityId,
        err: {
          name: error.name,
          message: error.message,
        },
      },
      "Failed to persist audit log"
    );
    return null;
  }
}

async function createProductEvent({
  userId = null,
  type,
  path = null,
  language = null,
  metadata = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    return await prisma.productEvent.create({
      data: {
        userId,
        type,
        path,
        language,
        metadata,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    logger.error(
      {
        event: "product_event_log_failed",
        userId,
        type,
        err: {
          name: error.name,
          message: error.message,
        },
      },
      "Failed to persist product event"
    );
    return null;
  }
}

export default {
  createModerationEvent,
  createAuditLog,
  createProductEvent,
};