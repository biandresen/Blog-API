import { ROLES } from "../constants.js";
import CustomError from "../utils/CustomError.js";

function canAccessUser(req, res, next) {
  const loggedInUserId = req.user?.id;
  const isAdmin = req.user?.role === ROLES.ADMIN_ROLE;
  const targetUserId = Number(req.params?.id);
  if (isNaN(targetUserId)) return next(new CustomError(400, "Invalid id given"));

  if (isAdmin || loggedInUserId === targetUserId) {
    return next();
  }

  return next(new CustomError(403, "Not authorized"));
}

export default canAccessUser;
