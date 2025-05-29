import { validationResult, matchedData } from "express-validator";
import tagService from "../services/tagService.js";
import CustomError from "../utils/CustomError.js";

async function getAllTags(req, res, next) {
  const queryParams = req.query;

  const tags = await tagService.getAllTags(queryParams);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    count: tags.length,
    message: tags.length > 0 ? "Tags retrieved successfully" : "No tags found",
    data: tags.length > 0 ? tags : [],
  });
}

async function getTagById(req, res, next) {
  const tagId = Number(req.params.id);
  if (!tagId) return next(new CustomError(400, "Invalid tag id given"));

  const tag = await tagService.getTagById(tagId);
  if (!tag) return next(new CustomError(400, `No tag found with id ${tagId}`));

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Tag retrieved successfully",
    data: tag,
  });
}

async function createTag(req, res, next) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(new CustomError(400, "Validation failed", validationErrors.array()));
  }

  const { tag: tagName } = matchedData(req);

  const createdTag = await tagService.createTag(tagName);

  res.status(201).json({
    status: "success",
    statusCode: 201,
    message: "Tag created successfully",
    data: createdTag,
  });
}

async function editTag(req, res, next) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return next(new CustomError(400, "Validation failed", validationErrors.array()));
  }

  const tagId = Number(req.params.id);
  if (!tagId) return next(new CustomError(400, "Invalid tag id given"));

  const { tag: tagName } = matchedData(req);

  const editedTag = await tagService.updateTag(tagId, tagName);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Tag edited successfully",
    data: editedTag,
  });
}

async function deleteTag(req, res, next) {
  const tagId = Number(req.params.id);
  if (!tagId) return next(new CustomError(400, "Invalid tag id given"));

  const deletedTag = await tagService.deleteTag(tagId);
  if (!deletedTag) return next(new CustomError(404, `No tag found with id ${tagId}`));

  res.status(204).send();
  // .json({
  //   status: "success",
  //   statusCode: 200,
  //   message: "Tag deleted successfully",
  //   data: null,
  // });
}

async function getPopularTags(req, res, next) {
  const limit = Number(req.query.limit) || 10;
  if (isNaN(limit)) return next(new CustomError(400, "Invalid limit given"));

  const tags = await tagService.getPopularTags(limit);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    count: tags.length,
    message: tags.length > 0 ? "Tags retrieved successfully" : "No tags found",
    data: tags.length > 0 ? tags : [],
  });
}

export default {
  getAllTags,
  getTagById,
  createTag,
  editTag,
  deleteTag,
  getPopularTags,
};
