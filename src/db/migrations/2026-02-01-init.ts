export const Migration20260201Init = {
  async up(sql) {
    await sql`
      CREATE TABLE notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        date TEXT NOT NULL,
        scope TEXT NOT NULL,
        category TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0
      )
    `;
    await sql`
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        date TEXT NOT NULL,
        scope TEXT NOT NULL,
        status TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0
      )
    `;
  },
};
