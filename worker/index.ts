import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { type AppEnv, clerkMiddleware } from "./clerk-middleware";

const app = new Hono<AppEnv>()
	// Public health check endpoint
	.get("/api/status", (c) => c.json({ status: "ok" }))
	// Apply authentication middleware to all /api/* routes
	.use("/api/*", clerkMiddleware())
	// GET /api/journal - Read encrypted database
	.get("/api/journal", async (c) => {
		const userId = c.get("userId");
		const storageKey = `${userId}:journal`;

		const object = await c.env.journal_bucket.get(storageKey);

		if (!object) {
			return c.json({ error: "Not found" }, 404);
		}

		const data = await object.text();
		return c.json({ data });
	})
	// PUT /api/journal - Write encrypted database
	.put(
		"/api/journal",
		zValidator(
			"json",
			z.object({
				data: z.string(),
			}),
		),
		async (c) => {
			const userId = c.get("userId");
			const storageKey = `${userId}:journal`;

			const { data } = c.req.valid("json");

			await c.env.journal_bucket.put(storageKey, data);

			return c.json({ success: true });
		},
	);

export default app;
export type AppType = typeof app;
