import type { Migration } from "kysely";
import { Migration001Init } from "./001-init";
import { Migration002DropGoals } from "./002-drop-goals";

export const migrations: Record<string, Migration> = {
  "001": Migration001Init,
  "002": Migration002DropGoals,
};
