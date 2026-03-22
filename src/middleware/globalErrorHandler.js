function globalErrorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Something went wrong.";
  let code = err.code || null;

  // Handle Prisma errors centrally
  if (err.code === "P2025") {
    return res.status(404).json({
      status: "fail",
      statusCode: 404,
      message: "No resource found with the ID given",
      code: "RESOURCE_NOT_FOUND",
    });
  }

  // Handle JWT errors centrally
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

  res.status(statusCode).json(responseBody);
}

export default globalErrorHandler;