import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";

const UPLOADS_ROOT = process.env.UPLOADS_DIR || "./uploads";
const MAX_IMAGE_BYTES = Number(process.env.MAX_IMAGE_SIZE_MB || 5) * 1024 * 1024;
const MAX_PDF_BYTES = Number(process.env.MAX_PDF_SIZE_MB || 10) * 1024 * 1024;

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function imageStorage(subfolder: string) {
  const folder = join(UPLOADS_ROOT, subfolder);
  ensureDir(folder);
  return diskStorage({
    destination: folder,
    filename: (req: any, file, cb) => {
      const userId = req.user?.id || "anon";
      cb(null, `${userId}-${Date.now()}${extname(file.originalname).toLowerCase()}`);
    },
  });
}

const IMAGE_TYPES = [".jpg", ".jpeg", ".png", ".webp"];

export const avatarUploadOptions = {
  storage: imageStorage("avatars"),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (!IMAGE_TYPES.includes(extname(file.originalname).toLowerCase())) {
      return cb(new BadRequestException("La foto debe ser JPG, PNG o WEBP."), false);
    }
    cb(null, true);
  },
};

export const logoUploadOptions = {
  storage: imageStorage("logos"),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (!IMAGE_TYPES.includes(extname(file.originalname).toLowerCase())) {
      return cb(new BadRequestException("El logo debe ser JPG, PNG o WEBP."), false);
    }
    cb(null, true);
  },
};

export const cvUploadOptions = {
  storage: imageStorage("cvs"),
  limits: { fileSize: MAX_PDF_BYTES },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (extname(file.originalname).toLowerCase() !== ".pdf") {
      return cb(new BadRequestException("El CV debe ser un archivo PDF."), false);
    }
    cb(null, true);
  },
};

export const UPLOADS_ROOT_PATH = UPLOADS_ROOT;
