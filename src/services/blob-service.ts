import { db } from "@/db/client";
import { authedFetch } from "@/stores/api";
import { encryptBytes, decryptBytes } from "@/crypto";
import { toLocalISO } from "@/utils/dates";

const inflightFetches = new Map<string, Promise<void>>();

export const blobService = {
  async uploadPending(dek: CryptoKey): Promise<void> {
    const pending = await db.selectFrom("blob_uploads").select("blob_id").execute();

    for (const { blob_id } of pending) {
      const row = await db
        .selectFrom("blobs")
        .select("data")
        .where("id", "=", blob_id)
        .executeTakeFirst();

      if (!row) {
        await db.deleteFrom("blob_uploads").where("blob_id", "=", blob_id).execute();
        continue;
      }

      const ciphertext = await encryptBytes(new Uint8Array(row.data), dek);
      const res = await authedFetch(`/api/blobs/${blob_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": String(ciphertext.byteLength),
        },
        body: ciphertext,
      });

      if (!res.ok) {
        console.error(`Failed to upload blob ${blob_id}: ${res.status}`);
        continue;
      }

      await db.deleteFrom("blob_uploads").where("blob_id", "=", blob_id).execute();
    }
  },

  async deletePending(): Promise<void> {
    const pending = await db.selectFrom("blob_deletes").select("blob_id").execute();

    for (const { blob_id } of pending) {
      const res = await authedFetch(`/api/blobs/${blob_id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) {
        console.error(`Failed to delete blob ${blob_id}: ${res.status}`);
        continue;
      }
      await db.deleteFrom("blob_deletes").where("blob_id", "=", blob_id).execute();
    }
  },

  async fetchAndCache(blobId: string, dek: CryptoKey): Promise<void> {
    const existing = inflightFetches.get(blobId);
    if (existing) return existing;

    const promise = (async () => {
      const res = await authedFetch(`/api/blobs/${blobId}`);
      if (!res.ok) {
        if (res.status !== 404) console.error(`Failed to fetch blob ${blobId}: ${res.status}`);
        return;
      }
      const ciphertext = new Uint8Array(await res.arrayBuffer());
      const plaintext = await decryptBytes(ciphertext, dek);
      await db
        .insertInto("blobs")
        .values({ id: blobId, data: plaintext, created_at: toLocalISO(new Date()) })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    })().finally(() => {
      inflightFetches.delete(blobId);
    });

    inflightFetches.set(blobId, promise);
    return promise;
  },
};
