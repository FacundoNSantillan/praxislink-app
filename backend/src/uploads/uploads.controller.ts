import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { readFile } from "fs/promises";
import { PDFParse } from "pdf-parse";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "../common/enums";
import { UsersService } from "../users/users.service";
import { avatarUploadOptions, cvUploadOptions, logoUploadOptions } from "./multer.config";
import { extractKeywordsFromCvText } from "../applications/cv-keywords";

async function extractCvKeywords(filePath: string): Promise<string[]> {
  try {
    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return extractKeywordsFromCvText(result.text || "");
  } catch {
    // Si el PDF no se puede leer (escaneado como imagen, corrupto, etc.)
    // seguimos sin palabras clave automáticas en vez de romper la subida.
    return [];
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("uploads")
export class UploadsController {
  constructor(private usersService: UsersService) {}

  @Roles(UserRole.ESTUDIANTE)
  @Post("avatar")
  @UseInterceptors(FileInterceptor("file", avatarUploadOptions))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthUser) {
    if (!file) throw new BadRequestException("No se recibió ningún archivo.");
    const path = `/uploads/avatars/${file.filename}`;
    await this.usersService.updateStudentProfile(user.id, { avatarPath: path });
    return { path };
  }

  @Roles(UserRole.ESTUDIANTE)
  @Post("cv")
  @UseInterceptors(FileInterceptor("file", cvUploadOptions))
  async uploadCv(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthUser) {
    if (!file) throw new BadRequestException("No se recibió ningún archivo.");
    const path = `/uploads/cvs/${file.filename}`;
    const cvKeywords = await extractCvKeywords(file.path);
    await this.usersService.updateStudentProfile(user.id, {
      cvPath: path,
      cvOriginalName: file.originalname,
      cvKeywords,
    });
    return { path, originalName: file.originalname, cvKeywords };
  }

  @Roles(UserRole.EMPRESA, UserRole.UNIVERSIDAD)
  @Post("logo")
  @UseInterceptors(FileInterceptor("file", logoUploadOptions))
  async uploadLogo(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthUser) {
    if (!file) throw new BadRequestException("No se recibió ningún archivo.");
    const path = `/uploads/logos/${file.filename}`;
    if (user.role === UserRole.EMPRESA) {
      await this.usersService.updateCompanyProfile(user.id, { logoPath: path });
    } else {
      await this.usersService.updateUniversityProfile(user.id, { logoPath: path });
    }
    return { path };
  }
}
