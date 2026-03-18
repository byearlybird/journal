import type { Migration } from "kysely";
import { Migration20260201Init } from "./2026-02-01-init";
import { Migration20260316TaskRollover } from "./2026-03-16-task-rollover";
import { Migration20260318LexicalContent } from "./2026-03-18-lexical-content";

export const migrations: Record<string, Migration> = {
  "2026-02-01": Migration20260201Init,
  "2026-03-16": Migration20260316TaskRollover,
  "2026-03-18": Migration20260318LexicalContent,
};
