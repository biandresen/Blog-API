function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "Something went wrong.";

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
