import { createDatabase } from "@byearlybird/starling";
import { idbPlugin } from "@byearlybird/starling/plugin-idb";
import z from "zod";

export const db = createDatabase({
	name: "journal-auth",
	schema: {
		kv: {
			schema: z.object({
				id: z.literal("kv"),
				masterKey: z.string().nullable(),
				vaultKey: z.string().nullable(),
				accessToken: z.string().nullable(),
				refreshToken: z.string().nullable(),
			}),
			getId: (kv) => kv.id,
		},
	},
}).use(idbPlugin());
