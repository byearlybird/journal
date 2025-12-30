import { WorkerEntrypoint } from "cloudflare:workers";
import { createClerkClient } from "@clerk/backend";

interface Env {
	journal_bucket: R2Bucket;
	CLERK_SECRET_KEY: string;
	VITE_CLERK_PUBLISHABLE_KEY: string;
}

const KEY = "journal-entry";

export default class extends WorkerEntrypoint<Env> {
	async fetch(request: Request) {
		const clerkClient = createClerkClient({
			secretKey: this.env.CLERK_SECRET_KEY,
			publishableKey: this.env.VITE_CLERK_PUBLISHABLE_KEY,
		});

		const { isAuthenticated } = await clerkClient.authenticateRequest(request);

		if (!isAuthenticated) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		switch (request.method) {
			case "GET": {
				const object = await this.env.journal_bucket.get(KEY);

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
				await this.env.journal_bucket.put(KEY, text);
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
}
