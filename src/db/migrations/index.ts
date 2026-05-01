import type { Migration } from "kysely";
import { M001_init } from "./001.init";
import { M002_schema } from "./002.schema";
import { M003_moods } from "./003.moods";

export const migrations: Record<string, Migration> = {
  "2026-04-16": M001_init,
  "2026-04-22": M002_schema,
  "2026-05-01": M003_moods,
};
