import type { Migration } from "kysely";
import { Migration20250101 } from "./2025-01-01-initial";

export const migrations: Record<string, Migration> = {
	"2025-01-01": Migration20250101,
};
