import jwt from "jsonwebtoken";

async function optionalAuth(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decodedUser = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decodedUser;

    return next();
  } catch (err) {
    console.error("optionalAuth failed:", err);
    req.user = null;
    return next();
  }
}

export default optionalAuth;