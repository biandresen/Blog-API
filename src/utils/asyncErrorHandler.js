/**
 * Wraps an async route handler and forwards errors to Express error middleware.
 *
 * @param {Function} fn - An async Express route handler (req, res, next).
 * @returns {Function} Wrapped function with automatic error catching.
 */

function asyncErrorHandler(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

export default asyncErrorHandler;
