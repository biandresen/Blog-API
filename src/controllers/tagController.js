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

export default {
  getAllTags,
  getTagById,
};
