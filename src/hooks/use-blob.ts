import { useEffect, useState } from "react";
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

  const loaded = rows !== undefined;
  const present = loaded && rows.length > 0;

  useEffect(() => {
    if (!id || !loaded || present) return;
    const dek = $dek.get();
    if (dek.status !== "ready") return;
    blobService.fetchAndCache(id, dek.dek).catch(() => {});
  }, [id, loaded, present]);

  if (!id) return null;
  return rows?.[0]?.data ?? null;
}

export function useBlobUrl(id: string | null | undefined): string | null {
  const bytes = useBlob(id);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!bytes) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>]));
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [bytes]);

  return url;
}
