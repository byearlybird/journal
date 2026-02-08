import { appDataDir } from "@tauri-apps/api/path";
import Database, { type QueryResult } from "@tauri-apps/plugin-sql";
import type { migrations } from "./migrations";

export interface Migration {
  version: number;
  name: string;
  up: (db: DbService) => Promise<void>;
}

type MigrationList = typeof migrations;

class DbService {
  #db: Database | null = null;

  #getDb(): Database {
    if (!this.#db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return this.#db;
  }

  async init(migrationList: MigrationList): Promise<void> {
    const dir = await appDataDir();
    this.#db = await Database.load(`sqlite:${dir}journal-v1.db`);
    await this.#runMigrations(migrationList);
  }

  async select<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.#getDb().select(sql, params);
  }

  async execute(sql: string, params: unknown[] = []): Promise<QueryResult> {
    return this.#getDb().execute(sql, params);
  }

  async transaction(fn: () => Promise<void>): Promise<void> {
    await this.execute("BEGIN TRANSACTION");
    try {
      await fn();
      await this.execute("COMMIT");
    } catch (e) {
      await this.execute("ROLLBACK");
      throw e;
    }
  }

  async #runMigrations(migrationList: MigrationList): Promise<void> {
    await this.execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )
    `);

    const applied = await this.select<{ version: number }>(
      "SELECT version FROM _migrations ORDER BY version",
    );
    const appliedSet = new Set(applied.map((r) => r.version));

    for (const migration of migrationList) {
      if (appliedSet.has(migration.version)) continue;

      await this.transaction(async () => {
        await migration.up(this);
        await this.execute(
          "INSERT INTO _migrations (version, name, applied_at) VALUES ($1, $2, $3)",
          [migration.version, migration.name, new Date().toISOString()],
        );
      });
    }
  }
}

export const dbService = new DbService();
