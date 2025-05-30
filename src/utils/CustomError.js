/**
 * Custom application error class to standardize error structure.
 */

export default class CustomError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 500).
   * @param {string} message - Error message.
   * @param {Array<Object>} [errors=null] - Optional array of additional error details (e.g., validation errors).
   */

  constructor(statusCode = 500, message = "Something went wrong", errors = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    if (errors) {
      this.errors = errors;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}
