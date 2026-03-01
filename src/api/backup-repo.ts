import { db } from "./db/index";
import { Backup } from "./db/schema";

export const backupRepo = {
  getByUserId: async (userId: string): Promise<Backup | undefined> => {
    return db.selectFrom("backups").where("user_id", "=", userId).selectAll().executeTakeFirst();
  },
  upsert: async (userId: string, data: string): Promise<void> => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db
      .insertInto("backups")
      .values({ id, user_id: userId, data, created_at: now, updated_at: now })
      .onConflict((oc) => oc.column("user_id").doUpdateSet({ data, updated_at: now }))
      .execute();
  },
};

export type BackupRepo = typeof backupRepo;
