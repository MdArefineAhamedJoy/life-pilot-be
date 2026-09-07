import { createApp } from "../src/app";

let application: ReturnType<typeof createApp> | undefined;

export default async function handler(req: unknown, res: unknown) {
  application ??= createApp();
  const app = await application;
  return app.getHttpAdapter().getInstance()(req, res);
}
