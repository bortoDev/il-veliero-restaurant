import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors';
import { env } from '../config/environment';

// Base upload directory relative to project execution root
export const UPLOAD_DIR = path.resolve(process.cwd(), env.upload.dir || 'uploads');

// Ensure upload directory exists synchronously
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Disk storage engine configuration
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    // Re-verify directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const randomHex = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const safeFilename = `media-${timestamp}-${randomHex}${extension}`;
    cb(null, safeFilename);
  },
});

// Allowed MIME types whitelist
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file type: ${file.mimetype}. Allowed formats: JPEG, PNG, WEBP, GIF.`
      )
    );
  }
};

// 5MB upload limit
export const MAX_FILE_SIZE_BYTES = env.upload.maxFileSizeBytes || 5 * 1024 * 1024;

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});

// Single image upload middleware wrapper for 'image' form-data field
export const uploadSingleImage = upload.single('image');

export default upload;
