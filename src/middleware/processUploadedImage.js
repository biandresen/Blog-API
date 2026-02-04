import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import CustomError from "../utils/CustomError.js";
import { IMAGE_MIME_WHITELIST } from "../utils/imageUploadPresets.js";
import { UPLOADS_DIR } from "../config/paths.js";

function safeIdPart(value) {
  return String(value ?? "unknown").replace(/[^a-zA-Z0-9_-]/g, "");
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Fast encode path for ARM/Raspberry Pi:
 * - Avoids multiple re-encodes in a loop (very expensive).
 * - Optionally does ONE fallback encode if the first exceeds maxBytes.
 */
async function encodeWebpFast(image, webpOptions, maxBytes) {
  const effort = Number.isInteger(webpOptions?.effort) ? webpOptions.effort : 2;

  const qualityStart = Number.isInteger(webpOptions?.qualityStart) ? webpOptions.qualityStart : 80;
  const qualityMin = Number.isInteger(webpOptions?.qualityMin) ? webpOptions.qualityMin : 60;
  const qualityStep = Number.isInteger(webpOptions?.qualityStep) ? webpOptions.qualityStep : 15;

  // First attempt
  let quality = qualityStart;
  let buf = await image.webp({ quality, effort }).toBuffer();
  if (buf.length <= maxBytes) return { buf, quality };

  // Single fallback attempt (still much faster than a while-loop)
  quality = Math.max(qualityMin, qualityStart - qualityStep);
  if (quality === qualityStart) {
    throw new CustomError(413, "Image too large after compression");
  }

  buf = await image.webp({ quality, effort }).toBuffer();
  if (buf.length <= maxBytes) return { buf, quality };

  throw new CustomError(413, "Image could not be compressed under the size limit");
}

function buildFilename({ idPart, ext = "webp" }) {
  const stamp = Date.now();
  const rand = crypto.randomBytes(6).toString("hex");
  return `${idPart}-${stamp}-${rand}.${ext}`;
}

export function processUploadedImage(preset) {
  if (!preset?.folder) {
    throw new Error("processUploadedImage: preset.folder is required (e.g. 'avatars').");
  }
  if (!preset?.maxBytes || typeof preset.maxBytes !== "number") {
    throw new Error("processUploadedImage: preset.maxBytes must be a number.");
  }

  return async function processUploadedImageMiddleware(req, _res, next) {
    try {
      if (!req.file) return next();

      // Stronger validation than multer mimetype: sniff the actual bytes
      const detected = await fileTypeFromBuffer(req.file.buffer);
      if (!detected || !IMAGE_MIME_WHITELIST.has(detected.mime)) {
        throw new CustomError(400, "Invalid image file. Only JPEG, PNG, or WebP are allowed.");
      }

      // Disk destination: UPLOADS_DIR/<preset.folder>
      const destDir = path.resolve(UPLOADS_DIR, preset.folder);
      await ensureDir(destDir);

      // Build sharp pipeline
      let img = sharp(req.file.buffer, { failOn: "error" }).rotate();

      if (preset.width && preset.height) {
        img = img.resize(preset.width, preset.height, { fit: preset.fit ?? "cover" });
      } else if (preset.maxWidth) {
        img = img.resize({
          width: preset.maxWidth,
          withoutEnlargement: true,
          fit: preset.fit ?? "inside",
        });
      }

      // Encode (fast)
      const { buf } = await encodeWebpFast(img, preset.webp, preset.maxBytes);

      // Write file
      const idPart = safeIdPart(req.params?.id ?? req.user?.id);
      const filename = buildFilename({ idPart, ext: "webp" });

      const fullPath = path.join(destDir, filename);
      await fs.writeFile(fullPath, buf, { flag: "wx" });

      // Public URL is always: /uploads/<folder>/<filename>
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
