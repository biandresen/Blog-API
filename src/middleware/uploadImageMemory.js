import multer from "multer";
import CustomError from "../utils/CustomError.js";
import { IMAGE_MIME_WHITELIST } from "../utils/imageUploadPresets.js";

export function uploadImageMemory({ maxInputBytes }) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxInputBytes },
    fileFilter: (_req, file, cb) => {
      // Cheap check (not sufficient alone, but good early reject)
      if (!IMAGE_MIME_WHITELIST.has(file.mimetype)) {
        return cb(new CustomError(400, "Only JPEG, PNG, or WebP images are allowed"));
      }
      cb(null, true);
    },
  });
}
