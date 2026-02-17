/**
 * Sends a standardized success response.
 *
 * @param {import("express").Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} [data=null]
 * @param {number|null} [count=null] - items in this response (often "page size")
 * @param {object|null} [meta=null]  - pagination meta etc.
 */
function successResponse(res, statusCode, message, data = null, count = null, meta = null) {
  const status = String(statusCode).startsWith("2") ? "success" : "fail";

  const response = {
    status,
    statusCode,
    message,
    data,
  };

  if (typeof count === "number") response.count = count;
  if (meta && typeof meta === "object") response.meta = meta;

  return res.status(statusCode).json(response);
}

export default successResponse;
