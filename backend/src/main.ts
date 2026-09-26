import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { existsSync } from "fs";
import { join } from "path";
import type { Request, Response, NextFunction } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({ origin: config.get<string>("CORS_ORIGIN") || "http://localhost:5173" });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const uploadsDir = config.get<string>("UPLOADS_DIR") || "./uploads";
  app.useStaticAssets(join(process.cwd(), uploadsDir), { prefix: "/uploads" });

  app.setGlobalPrefix("api");

  // Si existe una build del frontend en ./public (ver backend/README-DEPLOY.md),
  // el propio backend la sirve. Así todo el proyecto (API + archivos + sitio)
  // queda expuesto en un solo puerto, ideal para hostearlo en un solo lugar
  // (por ejemplo, un servidor casero con un único túnel hacia internet).
  const publicDir = join(process.cwd(), "public");
  if (existsSync(publicDir)) {
    app.useStaticAssets(publicDir);
    app.getHttpAdapter().get("*", (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
      res.sendFile(join(publicDir, "index.html"));
    });
  }

  const port = config.get<number>("PORT") || 3000;
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`PraxisLink escuchando en http://localhost:${port} (API en /api)`);
}
bootstrap();
