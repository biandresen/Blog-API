import { imagePresets } from "../utils/imageUploadPresets.js";
import { uploadImageMemory } from "./uploadImageMemory.js";
import { processUploadedImage } from "./processUploadedImage.js";

const uploadAvatar = [
  uploadImageMemory({ maxInputBytes: imagePresets.avatar.maxInputBytes }).single("avatar"),
  processUploadedImage(imagePresets.avatar),
];

export default uploadAvatar