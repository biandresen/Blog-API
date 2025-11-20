import multer from "multer";
import path from "path";
import fs from "fs";
import CustomError from "../utils/CustomError.js"; // import your CustomError

const LIMIT_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const uploadDir = path.join(process.cwd(), "uploads", "avatars");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}-${Date.now()}${ext}`);
  },
});

const uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new CustomError(400, "Only image files are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: LIMIT_FILE_SIZE },
});

export default uploadAvatar;
