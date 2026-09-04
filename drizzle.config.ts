import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl =
  process.env.DATABASE_URL ??
  `postgres://${encodeURIComponent(process.env.DATABASE_USERNAME ?? "life_os_ai")}:${encodeURIComponent(process.env.DATABASE_PASSWORD ?? "life_os_ai")}@${process.env.DATABASE_HOST ?? "localhost"}:${process.env.DATABASE_PORT ?? "5432"}/${encodeURIComponent(process.env.DATABASE_NAME ?? "life_os_ai")}`;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
