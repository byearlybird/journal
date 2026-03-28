import type { Migration } from "kysely";
import { Migration001Init } from "./001-init";
import { Migration002DropGoals } from "./002-drop-goals";
import { Migration20260327Tags } from "./2026-03-27-tags";

export const migrations: Record<string, Migration> = {
  "001": Migration001Init,
  "002": Migration002DropGoals,
  "003": Migration20260327Tags,
};
