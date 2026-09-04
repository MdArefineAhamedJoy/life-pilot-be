import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const DATABASE_POOL = Symbol("DATABASE_POOL");
export const DRIZZLE = Symbol("DRIZZLE");

export type Database = ReturnType<typeof drizzle<typeof schema>>;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Pool({
          connectionString:
            configService.get<string>("DATABASE_URL") ??
            "postgres://life_os_ai:life_os_ai@localhost:5432/life_os_ai",
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
