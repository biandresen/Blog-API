export const REFRESH_TOKEN_COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true on prod (HTTPS)
  sameSite: "lax",
  path: "/api/v1/auth/refresh", // narrow scope
  maxAge: 7 * 24 * 60 * 60 * 1000,
};


export default REFRESH_TOKEN_COOKIE_SETTINGS;
