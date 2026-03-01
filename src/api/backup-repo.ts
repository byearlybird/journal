import { eq } from "drizzle-orm";
import { db, backups, type Backup } from "./db/index";

export const backupRepo = {
  getByUserId: async (userId: string): Promise<Backup | undefined> => {
    return db.select().from(backups).where(eq(backups.userId, userId)).get();
  },

  upsert: async (userId: string, data: string): Promise<void> => {
    const now = new Date().toISOString();
    db.insert(backups)
      .values({
        id: crypto.randomUUID(),
        userId,
        data,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: backups.userId,
        set: { data, updatedAt: now },
      })
      .run();
  },
};

export type BackupRepo = typeof backupRepo;
