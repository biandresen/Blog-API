const REFRESH_TOKEN_COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "None", //Strict
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export default REFRESH_TOKEN_COOKIE_SETTINGS;
