import { Inject, Injectable } from "@nestjs/common";
import { Pool } from "pg";
import { DATABASE_POOL } from "../db/database.module";

@Injectable()
export class HealthService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  getHealth() {
    return {
      status: "ok",
      service: "life-os-api",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  async getDatabaseHealth() {
    try {
      const result = await this.pool.query<{ ok: number }>("select 1 as ok");

      return {
        status: result.rows[0]?.ok === 1 ? "ok" : "unknown",
        database: "postgres",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "unavailable",
        database: "postgres",
        message: error instanceof Error ? error.message : "Database connection failed.",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
