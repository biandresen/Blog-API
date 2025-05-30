const CLEAR_COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
};

export default CLEAR_COOKIE_SETTINGS;
