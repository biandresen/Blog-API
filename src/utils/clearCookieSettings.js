export const CLEAR_COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/v1/auth/refresh",
};

export default CLEAR_COOKIE_SETTINGS;
