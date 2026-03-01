import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sqlite = new Database(process.env.DATABASE_URL);
const db = drizzle({ client: sqlite });

migrate(db, { migrationsFolder: "./drizzle" });

console.log("Migrations complete");
sqlite.close();
