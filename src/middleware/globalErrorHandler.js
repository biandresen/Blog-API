function globalErrorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Something went wrong.";

  // Handle Prisma errors centrally
  if (err.code === "P2025") {
    return res.status(404).json({
      status: "fail",
      statusCode: 404,
      message: "No resource found with the ID given",
    });
  }

  // Handle JWT errors centrally
  if (err.name === "JsonWebTokenError") {
    statusCode = 400;
    message = "Invalid token. Please login again.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please login again.";
  }

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status,
      statusCode,
      message,
      errors: err.errors || undefined, // optional field for validation errors
      stack: err.stack,
    });
  }

  // Production: hide internal error details like stack trace
  res.status(statusCode).json({
    status,
    statusCode,
    message,
    errors: err.errors || undefined, // optional field for validation errors
  });
}

export default globalErrorHandler;
