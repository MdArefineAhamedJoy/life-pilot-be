import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const DATABASE_POOL = Symbol("DATABASE_POOL");
export const DRIZZLE = Symbol("DRIZZLE");

export type Database = ReturnType<typeof drizzle<typeof schema>>;

function databaseUrl(configService: ConfigService) {
  const configuredUrl = configService.get<string>("DATABASE_URL");
  if (configuredUrl) return configuredUrl;

  const username = configService.get<string>("DATABASE_USERNAME") ?? "life_os_ai";
  const password = configService.get<string>("DATABASE_PASSWORD") ?? "life_os_ai";
  const host = configService.get<string>("DATABASE_HOST") ?? "localhost";
  const port = configService.get<string>("DATABASE_PORT") ?? "5432";
  const database = configService.get<string>("DATABASE_NAME") ?? "life_os_ai";
  return `postgres://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Pool({
          connectionString: databaseUrl(configService),
          ssl: configService.get<string>("DATABASE_SSL") === "true" ? { rejectUnauthorized: false } : undefined,
        }),
    },
    {
      provide: DRIZZLE,
      inject: [DATABASE_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema }),
    },
  ],
  exports: [DATABASE_POOL, DRIZZLE],
})
export class DatabaseModule {}
