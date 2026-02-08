import type { Migration } from "../service";

export const Migration20260201Init: Migration = {
  version: 1,
  name: "2026-02-01-init",
  async up(db) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        date TEXT NOT NULL,
        scope TEXT NOT NULL,
        category TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        date TEXT NOT NULL,
        scope TEXT NOT NULL,
        status TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0
      )
    `);
  },
};
