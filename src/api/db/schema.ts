import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const backups = sqliteTable("backups", {
  id: text().primaryKey(),
  userId: text().notNull().unique(),
  data: text().notNull(),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
});

export type Backup = typeof backups.$inferSelect;
