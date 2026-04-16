import { createClerkClient } from "@clerk/backend";
import { ORPCError, os } from "@orpc/server";

export type BaseContext = {
  db: D1Database;
  userId: string;
};

export function makeClerkClient(env: Env) {
  return createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  });
}

export async function authenticateRequest(request: Request, env: Env): Promise<string> {
  const clerkClient = makeClerkClient(env);
  const authState = await clerkClient.authenticateRequest(request, {
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  });

  if (!authState.isAuthenticated || !authState.toAuth()?.userId) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return authState.toAuth()!.userId;
}

export const protectedOs = os.$context<BaseContext>();
