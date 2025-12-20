import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import CustomError from "../utils/CustomError.js";
import { IMAGE_MIME_WHITELIST } from "../utils/imageUploadPresets.js";
import { UPLOADS_DIR } from "../config/paths.js";

function safeIdPart(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "");
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function encodeWebpUnderLimit(image, { qualityStart, qualityMin, qualityStep, effort }, maxBytes) {
  let quality = qualityStart;

  while (quality >= qualityMin) {
    const buf = await image.webp({ quality, effort }).toBuffer();
    if (buf.length <= maxBytes) return { buf, quality };
    quality -= qualityStep;
  }

  const buf = await image.webp({ quality: qualityMin, effort }).toBuffer();
  if (buf.length <= maxBytes) return { buf, quality: qualityMin };

  throw new CustomError(413, "Image could not be compressed under the size limit");
}

export function processUploadedImage(preset) {
  return async function processUploadedImageMiddleware(req, _res, next) {
    try {
      if (!req.file) return next();

      const detected = await fileTypeFromBuffer(req.file.buffer);
      if (!detected || !IMAGE_MIME_WHITELIST.has(detected.mime)) {
        throw new CustomError(400, "Invalid image file. Only JPEG, PNG, or WebP are allowed.");
      }

      // ✅ Write to UPLOADS_DIR/<preset.folder>
      // where preset.folder is e.g. "avatars"
      const destDir = path.resolve(UPLOADS_DIR, preset.folder);
      await ensureDir(destDir);

      let img = sharp(req.file.buffer, { failOn: "error" }).rotate();

      if (preset.width && preset.height) {
        img = img.resize(preset.width, preset.height, { fit: preset.fit });
      } else if (preset.maxWidth) {
        img = img.resize({ width: preset.maxWidth, withoutEnlargement: true, fit: preset.fit });
      }

      const { buf } = await encodeWebpUnderLimit(img, preset.webp, preset.maxBytes);

      const idPart = safeIdPart(req.params?.id ?? req.user?.id ?? "unknown");
      const stamp = Date.now();
      const rand = crypto.randomBytes(6).toString("hex");
      const filename = `${idPart}-${stamp}-${rand}.webp`;

      const fullPath = path.join(destDir, filename);
      await fs.writeFile(fullPath, buf, { flag: "wx" });

      // ✅ Build canonical public URL explicitly:
      // public URL is always /uploads/<folder>/<filename>
      req.processedImage = {
        filename,
        relativeUrl: `/uploads/${preset.folder}/${filename}`,
        bytes: buf.length,
        mime: "image/webp",
      };

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
