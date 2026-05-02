import { db } from "@/db/client";
import { toLocalISO } from "@/utils/dates";

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

    if (blobIds.length > 0) {
      const localISO = toLocalISO(new Date());
      for (const blobId of blobIds) {
        await db
          .insertInto("blob_deletes")
          .values({ blob_id: blobId, enqueued_at: localISO })
          .onConflict((oc) => oc.column("blob_id").doNothing())
          .execute();
        await db.deleteFrom("blob_uploads").where("blob_id", "=", blobId).execute();
        await db.deleteFrom("blobs").where("id", "=", blobId).execute();
      }
    }

    await db.deleteFrom("moments").where("id", "=", id).execute();
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

    const localISO = toLocalISO(new Date());
    for (const blobId of blobIds) {
      await db
        .insertInto("blob_deletes")
        .values({ blob_id: blobId, enqueued_at: localISO })
        .onConflict((oc) => oc.column("blob_id").doNothing())
        .execute();
      await db.deleteFrom("blob_uploads").where("blob_id", "=", blobId).execute();
      await db.deleteFrom("blobs").where("id", "=", blobId).execute();
    }

    await db
      .updateTable("moments")
      .set({ image_blob_id: null, thumbnail_blob_id: null })
      .where("id", "=", id)
      .execute();
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
