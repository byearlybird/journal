import { Hono } from "hono";
import { type AppEnv, clerkMiddleware } from "./clerk-middleware";

const app = new Hono<AppEnv>();

// Public health check endpoint
app.get("/api/status", (c) => c.json({ status: "ok" }));

// Apply authentication middleware to all /api/* routes
app.use("/api/*", clerkMiddleware());

// GET /api/journal - Read encrypted database
app.get("/api/journal", async (c) => {
	const userId = c.get("userId");
	const storageKey = `${userId}:journal`;

	const object = await c.env.journal_bucket.get(storageKey);

	if (!object) {
		return c.json({ error: "Not found" }, 404);
	}

	return c.body(await object.arrayBuffer(), 200, {
		"Content-Type": "application/octet-stream",
	});
});

// PUT /api/journal - Write encrypted database
app.put("/api/journal", async (c) => {
	const userId = c.get("userId");
	const storageKey = `${userId}:journal`;

	try {
		const arrayBuffer = await c.req.arrayBuffer();
		await c.env.journal_bucket.put(storageKey, arrayBuffer);

		return c.json({ success: true }, 200);
	} catch (error) {
		return c.json(
			{
				error: "Invalid request body",
				details: error instanceof Error ? error.message : String(error),
			},
			400,
		);
	}
});

export default app;

