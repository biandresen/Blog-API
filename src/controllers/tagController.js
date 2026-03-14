import { matchedData } from "express-validator";
import tagService from "../services/tagService.js";
import CustomError from "../utils/CustomError.js";
import successResponse from "../utils/successResponse.js";

async function getAllTags(req, res, next) {
    const language = req.language;

    const queryParams = matchedData(req) || {};
    const result = await tagService.getAllTags({ ...queryParams, language });

    // service returns { items, total, page, limit, language }
    const items = result.items ?? [];
    const message = items.length > 0 ? "Tags retrieved successfully" : "No tags found";

    return successResponse(res, 200, message, items, items.length, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
}

async function getTagById(req, res, next) {
    const language = req.language;

    const tagId = Number(req.params.id);
    if (isNaN(tagId)) return next(new CustomError(400, "Invalid tag id given"));

    const tag = await tagService.getTagById(tagId, { language });
    if (!tag) return next(new CustomError(404, "Tag not found for this language"));

    return successResponse(res, 200, "Tag retrieved successfully", tag, 1);
}

async function createTag(req, res, next) {
    const language = req.language;

    const { tag: tagName } = matchedData(req);

    const createdTag = await tagService.createTag(tagName, { language });

    return successResponse(res, 201, "Tag created successfully", createdTag, 1);
}

async function editTag(req, res, next) {
    const language = req.language;

    const tagId = Number(req.params.id);
    if (isNaN(tagId)) return next(new CustomError(400, "Invalid tag id given"));

    const { tag: tagName } = matchedData(req);

    const editedTag = await tagService.updateTag(tagId, tagName, { language });
    if (!editedTag) return next(new CustomError(404, "Tag not found for this language"));

    return successResponse(res, 200, "Tag edited successfully", editedTag, 1);
}

async function deleteTag(req, res, next) {
    const language = req.language;

    const tagId = Number(req.params.id);
    if (isNaN(tagId)) return next(new CustomError(400, "Invalid tag id given"));

    const deleted = await tagService.deleteTag(tagId, { language });
    if (!deleted) return next(new CustomError(404, "Tag not found for this language"));

    return successResponse(res, 200, "Tag deleted successfully", null, 0);
}

async function getPopularTags(req, res, next) {
    const language = req.language;

    const { limit } = matchedData(req, { locations: ["query"] }) || {};
    const tags = await tagService.getPopularTags({
      language,
      limit: Number(limit) || 10,
      publishedOnly: true,
    });

    const message = tags.length > 0 ? "Tags retrieved successfully" : "No tags found";
    const data = tags.length > 0 ? tags : [];
    const count = tags.length;

    return successResponse(res, 200, message, data, count);
}

export default {
  getAllTags,
  getTagById,
  createTag,
  editTag,
  deleteTag,
  getPopularTags,
};