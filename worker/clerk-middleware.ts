import { type ClerkClient, createClerkClient } from "@clerk/backend";
import { createMiddleware } from "hono/factory";

// Define environment types for type-safe Hono context
export type AppEnv = {
	Variables: { userId: string };
	Bindings: {
		journal_bucket: R2Bucket;
		CLERK_SECRET_KEY: string;
		VITE_CLERK_PUBLISHABLE_KEY: string;
	};
};

// Cache the Clerk client to avoid recreating it on every request
// Module-level cache persists across requests within the same isolate
let clerkClient: ClerkClient | null = null;

function getClerkClient(env: AppEnv["Bindings"]): ClerkClient {
	if (!clerkClient) {
		clerkClient = createClerkClient({
			secretKey: env.CLERK_SECRET_KEY,
			publishableKey: env.VITE_CLERK_PUBLISHABLE_KEY,
		});
	}
	return clerkClient;
}

export function clerkMiddleware() {
	return createMiddleware<AppEnv>(async (c, next) => {
		const clerk = getClerkClient(c.env);

		const authResult = await clerk.authenticateRequest(c.req.raw);
		const { isAuthenticated, toAuth } = authResult;

		if (!isAuthenticated) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const { userId } = toAuth();

		c.set("userId", userId);

		await next();
	});
}
