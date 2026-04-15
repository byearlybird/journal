import type { Migration } from "kysely";
import { M001_init } from "./001.init";

export const migrations: Record<string, Migration> = {
  "2023-08-01": M001_init,
};
