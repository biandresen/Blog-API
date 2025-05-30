function createTokenData(req, refreshToken) {
  return {
    token: refreshToken,
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: req.get("User-Agent") || null,
    ipAddress: req.ip || null,
  };
}

export default createTokenData;
