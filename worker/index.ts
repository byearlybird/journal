import { WorkerEntrypoint } from "cloudflare:workers";

interface Env {
	journal_bucket: R2Bucket;
}

const KEY = "journal-entry";

export default class extends WorkerEntrypoint<Env> {
	async fetch(request: Request) {
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
