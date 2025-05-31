import { matchedData } from "express-validator";
import tagService from "../services/tagService.js";
import CustomError from "../utils/CustomError.js";
import successResponse from "../utils/successResponse.js";

async function getAllTags(req, res, next) {
  const queryParams = matchedData(req);

  const tags = await tagService.getAllTags(queryParams);

  const message = tags.length > 0 ? "Tags retrieved successfully" : "No tags found";
  const data = tags.length > 0 ? tags : [];
  const count = tags.length;

  successResponse(res, 200, message, data, count);
}

async function getTagById(req, res, next) {
  const tagId = Number(req.params.id);
  if (!tagId) return next(new CustomError(400, "Invalid tag id given"));

  const tag = await tagService.getTagById(tagId);
  // if (!tag) return next(new CustomError(404, `No tag found with id ${tagId}`));

  successResponse(res, 200, "Tag retrieved successfully", tag);
}

async function createTag(req, res, next) {
  const { tag: tagName } = matchedData(req);

  const createdTag = await tagService.createTag(tagName);

  successResponse(res, 201, "Tag created successfully", createdTag);
}

async function editTag(req, res, next) {
  const tagId = Number(req.params.id);
  if (!tagId) return next(new CustomError(400, "Invalid tag id given"));

  const { tag: tagName } = matchedData(req);

  const editedTag = await tagService.updateTag(tagId, tagName);
  // if (!editedTag) return next(new CustomError(404, `No tag found with id ${tagId}`));

  successResponse(res, 200, "Tag edited successfully", editedTag);
}

async function deleteTag(req, res, next) {
  const tagId = Number(req.params.id);
  if (isNaN(tagId)) return next(new CustomError(400, "Invalid tag id given"));

  const deletedTag = await tagService.deleteTag(tagId);
  // if (!deletedTag) return next(new CustomError(404, `No tag found with id ${tagId}`));

  successResponse(res, 200, "Tag deleted successfully", null);
}

async function getPopularTags(req, res, next) {
  const { limit } = matchedData(req) || 10;
  const tags = await tagService.getPopularTags(limit);

  const message = tags.length > 0 ? "Tags retrieved successfully" : "No tags found";
  const data = tags.length > 0 ? tags : [];
  const count = tags.length;

  successResponse(res, 200, message, data, count);
}

export default {
  getAllTags,
  getTagById,
  createTag,
  editTag,
  deleteTag,
  getPopularTags,
};
