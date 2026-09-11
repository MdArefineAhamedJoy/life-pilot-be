import "reflect-metadata";
import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

type HeaderResponse = {
  setHeader: (name: string, value: string) => void;
};

export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useBodyParser("json", { limit: "2mb" });
  app.use((_request: unknown, response: HeaderResponse, next: () => void) => {
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'none'; base-uri 'none'; frame-ancestors 'none'"
    );
    response.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    if (process.env.NODE_ENV === "production") {
      response.setHeader(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      );
    }
    next();
  });
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
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  });

  await app.init();
  return app;
}
