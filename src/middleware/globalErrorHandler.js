import logger from "../config/logger.js";

function globalErrorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Something went wrong.";
  let code = err.code || null;

  if (err.code === "P2025") {
    statusCode = 404;
    status = "fail";
    message = "No resource found with the ID given";
    code = "RESOURCE_NOT_FOUND";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 400;
    status = "fail";
    message = "Invalid token. Please login again.";
    code = "INVALID_TOKEN";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    status = "fail";
    message = "Your session has expired. Please login again.";
    code = "TOKEN_EXPIRED";
  }

  const logPayload = {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id ?? null,
    ipAddress: req.ip || null,
    userAgent: req.headers["user-agent"] || null,
    statusCode,
    code,
    err: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  };

  if (statusCode >= 500) {
    logger.error(
      {
        event: "server_error",
        ...logPayload,
      },
      message
    );
  } else {
    logger.warn(
      {
        event: "client_error",
        ...logPayload,
      },
      message
    );
  }

  const responseBody = {
    status,
    statusCode,
    message,
    code: code || undefined,
    errors: err.errors || undefined,
  };

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      ...responseBody,
      stack: err.stack,
    });
  }

  return res.status(statusCode).json(responseBody);
}

export default globalErrorHandler;