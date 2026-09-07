import { ConfigService } from "@nestjs/config";
import { createApp } from "./app";

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService);
  const port = configService.get<number>("API_PORT") ?? 4000;

  await app.listen(port);
}

void bootstrap();
