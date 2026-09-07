import "reflect-metadata";
import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useBodyParser("json", { limit: "2mb" });
  app.useGlobalPipes({
    transform(value, metadata) {
      if (
        metadata.type === "body" &&
        !metadata.data &&
        (!value || typeof value !== "object" || Array.isArray(value))
      ) {
        throw new BadRequestException("A JSON object is required.");
      }
      return value;
    },
  });

  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>("CORS_ORIGIN") ?? "http://localhost:3000";

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  await app.init();
  return app;
}
