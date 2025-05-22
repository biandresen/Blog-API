export default class CustomError extends Error {
  constructor(statusCode = 500, message = "Something went wrong", errors = null) {
    super(message);
    this.name = this.constructor.name; // 'CustomError'
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Good for distinguishing handled errors
    if (errors) {
      this.errors = errors; // attach full array here from validation errors
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
