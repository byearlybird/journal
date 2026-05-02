import { db } from "@/db/client";
import { toLocalISO } from "@/utils/dates";

// Drops a blob from local storage, queues its R2 deletion, and enqueues an
// `attachment_delete` sync_changes entry so other devices clear their local
// cache when they pull. Without that entry, receivers would hold orphaned blob
// rows after the moment update/tombstone arrives.
async function disposeBlob(blobId: string, ts: string) {
  await db
    .insertInto("blob_deletes")
    .values({ blob_id: blobId, enqueued_at: ts })
    .onConflict((oc) => oc.column("blob_id").doNothing())
    .execute();
  await db.deleteFrom("blob_uploads").where("blob_id", "=", blobId).execute();
  await db.deleteFrom("blobs").where("id", "=", blobId).execute();

  const state = await db
    .selectFrom("client_state")
    .select(["hlc_wall", "hlc_count", "node_id"])
    .executeTakeFirstOrThrow();
  const hlc = `${String(state.hlc_wall).padStart(15, "0")}@${String(state.hlc_count).padStart(8, "0")}@${state.node_id}`;

  await db
    .insertInto("sync_changes")
    .values({ table_name: "blobs", row_id: blobId, hlc, operation: "attachment_delete" })
    .onConflict((oc) =>
      oc.columns(["table_name", "row_id"]).doUpdateSet({ hlc, operation: "attachment_delete" }),
    )
    .execute();
}

export const momentService = {
  async createMoment(
    content: string,
    display: Uint8Array | null = null,
    thumbnail: Uint8Array | null = null,
    label: string | null = null,
  ) {
    const localISO = toLocalISO(new Date());

    let imageBlobId: string | null = null;
    let thumbnailBlobId: string | null = null;

    if (display) {
      imageBlobId = crypto.randomUUID();
      await db
        .insertInto("blobs")
        .values({ id: imageBlobId, data: display, created_at: localISO })
        .execute();
      await db
        .insertInto("blob_uploads")
        .values({ blob_id: imageBlobId, enqueued_at: localISO })
        .execute();
    }

    if (thumbnail) {
      thumbnailBlobId = crypto.randomUUID();
      await db
        .insertInto("blobs")
        .values({ id: thumbnailBlobId, data: thumbnail, created_at: localISO })
        .execute();
      await db
        .insertInto("blob_uploads")
        .values({ blob_id: thumbnailBlobId, enqueued_at: localISO })
        .execute();
    }

    await db
      .insertInto("moments")
      .values({
        id: crypto.randomUUID(),
        content,
        image_blob_id: imageBlobId,
        thumbnail_blob_id: thumbnailBlobId,
        label,
        date: localISO.slice(0, 10),
        created_at: localISO,
        content_edited_at: null,
      })
      .execute();
  },
  async delete(id: string) {
    const row = await db
      .selectFrom("moments")
      .select(["image_blob_id", "thumbnail_blob_id"])
      .where("id", "=", id)
      .executeTakeFirst();

    const blobIds = [row?.image_blob_id, row?.thumbnail_blob_id].filter(
      (x): x is string => typeof x === "string",
    );

    await db.deleteFrom("moments").where("id", "=", id).execute();

    if (blobIds.length > 0) {
      const localISO = toLocalISO(new Date());
      for (const blobId of blobIds) {
        await disposeBlob(blobId, localISO);
      }
    }
  },
  async updateContent(id: string, content: string) {
    await db
      .updateTable("moments")
      .set({ content, content_edited_at: toLocalISO(new Date()) })
      .where("id", "=", id)
      .execute();
  },
  async removePhoto(id: string) {
    const row = await db
      .selectFrom("moments")
      .select(["image_blob_id", "thumbnail_blob_id"])
      .where("id", "=", id)
      .executeTakeFirst();

    const blobIds = [row?.image_blob_id, row?.thumbnail_blob_id].filter(
      (x): x is string => typeof x === "string",
    );

    if (blobIds.length === 0) return;

    await db
      .updateTable("moments")
      .set({ image_blob_id: null, thumbnail_blob_id: null })
      .where("id", "=", id)
      .execute();

    const localISO = toLocalISO(new Date());
    for (const blobId of blobIds) {
      await disposeBlob(blobId, localISO);
    }
  },
  async attachPhoto(id: string, display: Uint8Array, thumbnail: Uint8Array) {
    const localISO = toLocalISO(new Date());

    const imageBlobId = crypto.randomUUID();
    await db
      .insertInto("blobs")
      .values({ id: imageBlobId, data: display, created_at: localISO })
      .execute();
    await db
      .insertInto("blob_uploads")
      .values({ blob_id: imageBlobId, enqueued_at: localISO })
      .execute();

    const thumbnailBlobId = crypto.randomUUID();
    await db
      .insertInto("blobs")
      .values({ id: thumbnailBlobId, data: thumbnail, created_at: localISO })
      .execute();
    await db
      .insertInto("blob_uploads")
      .values({ blob_id: thumbnailBlobId, enqueued_at: localISO })
      .execute();

    await db
      .updateTable("moments")
      .set({ image_blob_id: imageBlobId, thumbnail_blob_id: thumbnailBlobId })
      .where("id", "=", id)
      .execute();
  },
};
