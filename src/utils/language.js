
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES_SET } from "../constants.js";

export function normalizeLanguage(language) {
  const lang = (language ?? DEFAULT_LANGUAGE).toString().toUpperCase();
  return SUPPORTED_LANGUAGES_SET.has(lang) ? lang : DEFAULT_LANGUAGE;
}

// Optional: if you prefer failing fast instead of defaulting
export function assertLanguage(language) {
  const lang = (language ?? "").toString().toUpperCase();
  if (!SUPPORTED_LANGUAGES_SET.has(lang)) {
    const err = new Error("Invalid language");
    err.status = 400;
    throw err;
  }
  return lang;
}