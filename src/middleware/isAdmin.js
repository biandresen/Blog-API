import CustomError from "../utils/CustomError.js";

function isAdmin(req, res, next) {
  if (req?.user?.role !== "ADMIN")
    return next(new CustomError(403, "Forbidden: Only admins are allowed to perform this action"));

  next();
}

export default isAdmin;
