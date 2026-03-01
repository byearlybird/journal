import { createClerkClient } from "@clerk/backend";
import { createMiddleware } from "hono/factory";
import type { AppEnv } from "./index";

interface ClerkMiddlewareOptions {
  secretKey: string;
  publishableKey: string;
}

export function clerkMiddleware({ secretKey, publishableKey }: ClerkMiddlewareOptions) {
  const clerk = createClerkClient({ secretKey, publishableKey });

  return createMiddleware<AppEnv>(async (c, next) => {
    const authResult = await clerk.authenticateRequest(c.req.raw);

    if (!authResult.isAuthenticated) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("userId", authResult.toAuth().userId);

    await next();
  });
}
