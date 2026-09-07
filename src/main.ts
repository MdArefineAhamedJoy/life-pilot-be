import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { BadRequestException } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser("json", { limit: "2mb" });
  app.useGlobalPipes({ transform(value, metadata) {
    if (metadata.type === "body" && !metadata.data && (!value || typeof value !== "object" || Array.isArray(value))) {
      throw new BadRequestException("A JSON object is required.");
    }
    return value;
  } });
  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>("CORS_ORIGIN") ?? "http://localhost:3000";
  const port = configService.get<number>("API_PORT") ?? 4000;

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  await app.listen(port);
}

void bootstrap();
