import type { Migration } from "kysely";
import { Migration20260218Backups } from "./02-18-2026-data";

export const migrations: Record<string, Migration> = {
  "2026-02-18-backups": Migration20260218Backups,
};
