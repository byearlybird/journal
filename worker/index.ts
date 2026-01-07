import { WorkerEntrypoint } from "cloudflare:workers";
import { createClerkClient } from "@clerk/backend";

interface Env {
	journal_bucket: R2Bucket;
	CLERK_SECRET_KEY: string;
	VITE_CLERK_PUBLISHABLE_KEY: string;
}

export default class extends WorkerEntrypoint<Env> {
	async fetch(request: Request) {
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

		const storageKey = `journaldb-${userId}`;

		switch (request.method) {
			case "GET": {
				const object = await this.env.journal_bucket.get(storageKey);

				if (object === null) {
					return new Response(null, { status: 204 });
				}

				return new Response(object.body, {
					headers: { "Content-Type": "application/octet-stream" },
				});
			}
			case "PUT": {
				try {
					const arrayBuffer = await request.arrayBuffer();
					await this.env.journal_bucket.put(storageKey, arrayBuffer);
					return new Response(null, { status: 204 });
				} catch (error) {
					return new Response(
						JSON.stringify({
							error: "Invalid request body",
							details: error instanceof Error ? error.message : String(error),
						}),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
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
}
