import { useEffect } from "react";
import type { Selectable } from "kysely";
import type { BlobTable } from "@/db/schema";
import { $dek } from "@/stores/dek";
import { blobService } from "@/services/blob-service";
import { useDBQuery } from "./use-db-query";

export function useBlob(id: string | null | undefined): Uint8Array | null {
  const rows = useDBQuery((db) =>
    db
      .selectFrom("blobs")
      .select("data")
      .where("id", "=", id ?? "")
      .limit(1),
  ) as Pick<Selectable<BlobTable>, "data">[] | undefined;

  useEffect(() => {
    if (!id) return;
    if (rows === undefined) return;
    if (rows.length > 0) return;
    const dek = $dek.get();
    if (dek.status !== "ready") return;
    blobService.fetchAndCache(id, dek.dek).catch(() => {});
  }, [id, rows]);

  if (!id) return null;
  return rows?.[0]?.data ?? null;
}
