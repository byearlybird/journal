import type { Migration } from "kysely";
import { Migration001Init } from "./001-init";

export const migrations: Record<string, Migration> = {
  "001": Migration001Init,
};
