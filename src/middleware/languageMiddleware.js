import { normalizeLanguage } from "../utils/language.js";

export function languageMiddleware(req, res, next) {
  const headerLang = req.get("X-App-Language");
  const queryLang = req.query?.lang;

  req.language = normalizeLanguage(queryLang ?? headerLang);

  if (process.env.NODE_ENV === "development") {
    res.setHeader("X-Resolved-Language", req.language);
  }

  next();
}