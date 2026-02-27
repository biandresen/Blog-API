import { matchedData } from "express-validator";
import successResponse from "../utils/successResponse.js";
import hallOfFameService from "../services/hallOfFameService.js";

async function getHallOfFameUsers(req, res) {
  const { period = "month", limit = 25 } = matchedData(req, { locations: ["query"] }) || {};
  const data = await hallOfFameService.getHallOfFameUsers({ period, limit: Number(limit) || 25 });

  return successResponse(res, 200, "Hall of Fame retrieved", data, data.length);
}

export default { getHallOfFameUsers };