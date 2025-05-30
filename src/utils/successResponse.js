/**
 * Sends a standardized success response.
 *
 * @param {import("express").Response} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g., 200, 201).
 * @param {string} message - Message to describe the outcome.
 * @param {any} [data=null] - Optional data payload.
 * @param {number|null} [count=null] - Optional item count (e.g., for paginated results).
 * @returns {void}
 */

function successResponse(res, statusCode, message, data = null, count = null) {
  const response = {
    status: "success",
    statusCode,
    message,
    data,
  };

  if (typeof count === "number") {
    response.count = count;
  }

  return res.status(statusCode).json(response);
}

export default successResponse;
