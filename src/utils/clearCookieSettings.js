const CLEAR_COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  path: "/", // <-- important for clearing the cookie
};

export default CLEAR_COOKIE_SETTINGS;
