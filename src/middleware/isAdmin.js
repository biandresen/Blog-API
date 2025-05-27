import CustomError from "../utils/CustomError.js";

function isAdmin(req, res, next) {
  if (req?.user?.role !== "ADMIN") return next(new CustomError(403, "Forbidden: Admins only"));

  next();
}

export default isAdmin;
