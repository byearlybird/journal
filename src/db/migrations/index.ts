import type { sql } from "../client";
import { Migration20260201Init } from "./2026-02-01-init";

export type Migration = {
  up: (sql: typeof sql) => Promise<void>;
};

export const migrations: Record<string, Migration> = {
  "2026-02-01": Migration20260201Init,
};
