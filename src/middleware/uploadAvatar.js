import multer from "multer";
import path from "path";
import fs from "fs";

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
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only images allowed"), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

export default uploadAvatar;
