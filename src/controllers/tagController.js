import tagService from "../services/tagService.js";

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

export default {
  getAllTags,
};
