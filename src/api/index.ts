import { Hono } from "hono";
import { migrator } from "./db/migrator";
import { clerkMiddleware } from "./clerk-middleware";
import { backupRouter } from "./backup-routes";
import { env } from "./env";

export type AppEnv = {
  Variables: { userId: string };
};

const migrationResult = await migrator.migrateToLatest();

if (migrationResult.error) {
  if (typeof migrationResult.error === "string") {
    throw new Error(migrationResult.error);
  }

  throw migrationResult.error;
}

export const api = new Hono<AppEnv>()
  .basePath("/api")
  .get("/status", (c) => c.json({ status: "ok" }))
  .use(
    clerkMiddleware({
      secretKey: env.CLERK_SECRET_KEY,
      publishableKey: env.PUBLIC_CLERK_PUBLISHABLE_KEY,
    }),
  )
  .route("/v0/backup", backupRouter);
