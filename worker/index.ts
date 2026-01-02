import { WorkerEntrypoint } from "cloudflare:workers";
import { createClerkClient } from "@clerk/backend";

interface Env {
	journal_bucket: R2Bucket;
	CLERK_SECRET_KEY: string;
	VITE_CLERK_PUBLISHABLE_KEY: string;
}

export default class extends WorkerEntrypoint<Env> {
	async fetch(request: Request) {
		const url = new URL(request.url);

		// Only handle the specific API route, let everything else pass through
		if (url.pathname === "/api/journal") {
			const clerkClient = createClerkClient({
				secretKey: this.env.CLERK_SECRET_KEY,
				publishableKey: this.env.VITE_CLERK_PUBLISHABLE_KEY,
			});

			const requestState = await clerkClient.authenticateRequest(request);

			if (!requestState.isAuthenticated) {
				return new Response(JSON.stringify({ error: "Unauthorized" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
				});
			}

			const userId = requestState.toAuth()?.userId;
			if (!userId) {
				return new Response(JSON.stringify({ error: "No user ID" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
				});
			}

			const storageKey = `journal-${userId}`;

			switch (request.method) {
				case "GET": {
					const object = await this.env.journal_bucket.get(storageKey);

					if (object === null) {
						return new Response("", { status: 200 });
					}

					const text = await object.text();
					return new Response(JSON.stringify({ content: text }), {
						headers: { "Content-Type": "application/json" },
					});
				}
				case "PUT": {
					const text = await request.text();
					await this.env.journal_bucket.put(storageKey, text);
					return new Response(JSON.stringify({ success: true }), {
						headers: { "Content-Type": "application/json" },
					});
				}
				default:
					return new Response("Method Not Allowed", {
						status: 405,
						headers: {
							Allow: "GET, PUT",
						},
					});
			}
		}

		// For non-API routes, we need to let them pass through to be handled by
		// the static asset serving or Vite dev server. In development, the Cloudflare
		// plugin should proxy to Vite. We'll fetch the request to forward it.
		// Note: This works because Cloudflare Workers can fetch from their own origin
		// and the routing will be handled by the framework.
		return fetch(request);
	}
}
