import { matchedData } from "express-validator";
import successResponse from "../utils/successResponse.js";
import leaderboardService from "../services/leaderboardService.js";
import CustomError from "../utils/CustomError.js";

async function getLeaderboardUsers(req, res, next) {
  const { period = "month", limit = 25 } = matchedData(req, { locations: ["query"] }) || {};

  const language = req.language;
  if (!language) {
    return next(new CustomError(500, "Language middleware not configured"));
  }

  const data = await leaderboardService.getLeaderboardUsers({
    language,
    period,
    limit: Number(limit) || 25,
  });

  return successResponse(res, 200, "Leaderboard retrieved", data, data.length);
}

export default { getLeaderboardUsers };
