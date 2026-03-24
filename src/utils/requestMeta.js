export function getRequestMeta(req) {
  return {
    ipAddress: req.ip || null,
    userAgent: req.headers["user-agent"] || null,
    path: req.originalUrl || null,
    userId: req.user?.id ?? null,
  };
}