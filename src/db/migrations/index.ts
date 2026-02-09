import type { Migration } from "kysely";
import { Migration20260201Init } from "./2026-02-01-init";

export const migrations: Record<string, Migration> = {
  "2026-02-01": Migration20260201Init,
};
