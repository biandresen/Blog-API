import CustomError from "../utils/CustomError.js";
import jwt from "jsonwebtoken";

function isAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return next(new CustomError(401, "Unauthorized. Please log in."));

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return next(new CustomError(401, "Invalid or expired token. Please log in again."));
  }
}

export default isAuthenticated;
