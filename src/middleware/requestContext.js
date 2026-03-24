import crypto from "crypto";

function requestContext(req, res, next) {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.id);
  next();
}

export default requestContext;