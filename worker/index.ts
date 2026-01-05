import { WorkerEntrypoint } from "cloudflare:workers";
import { createClerkClient } from "@clerk/backend";
import { pushPayloadSchema } from "../lib/sync-schema";

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
				try {
					const json = await request.json();
					const validated = pushPayloadSchema.parse(json);
					await this.env.journal_bucket.put(storageKey, validated.data);
					return new Response(JSON.stringify({ success: true }), {
						headers: { "Content-Type": "application/json" },
					});
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
