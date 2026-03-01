import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppEnv } from "./index";
import { BackupService } from "./backup-service";
import { backupRepo } from "./backup-repo";

const backupService = new BackupService(backupRepo);

export const backupRouter = new Hono<AppEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");

    const result = await backupService.getData(userId);

    if (result.status === "not_found") {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data: result.data });
  })
  .put("/", zValidator("json", z.object({ data: z.string().min(1) })), async (c) => {
    const userId = c.get("userId");
    const { data } = c.req.valid("json");
    await backupService.putData(userId, data);
    return c.json({ ok: true });
  });
