import type { Migration } from "kysely";
import { M001_init } from "./001.init";
import { M002_schema } from "./002.schema";
import { M003_moods } from "./003.moods";
import { M004_moments } from "./004.moments";
import { M005_moment_thumbnail } from "./005.moment-thumbnail";
import { M006_moment_blobs } from "./006.moment-blobs";
import { M007_blob_outboxes } from "./007.blob-outboxes";

export const migrations: Record<string, Migration> = {
  "2026-04-16": M001_init,
  "2026-04-22": M002_schema,
  "2026-05-01": M003_moods,
  "2026-05-01b": M004_moments,
  "2026-05-01c": M005_moment_thumbnail,
  "2026-05-01d": M006_moment_blobs,
  "2026-05-01e": M007_blob_outboxes,
};
