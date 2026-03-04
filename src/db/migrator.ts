import { sql } from "./client";
import { migrations } from "./migrations";

export async function runMigrations(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `;

  const applied = await sql`SELECT name FROM _migrations`;
  const appliedNames = new Set(applied.map((r) => r.name as string));

  for (const [name, migration] of Object.entries(migrations)) {
    if (!appliedNames.has(name)) {
      await migration.up(sql);
      await sql`INSERT INTO _migrations (name, applied_at) VALUES (${name}, ${new Date().toISOString()})`;
    }
  }
}
