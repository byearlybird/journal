import { openDB, type IDBPDatabase } from "idb";
import type { Database } from "./schema";

type JournalDB = IDBPDatabase<Database>;

let dbPromise: Promise<JournalDB> | null = null;

export function getDb(): Promise<JournalDB> {
  if (!dbPromise) {
    dbPromise = openDB<Database>("journal", 1, {
      upgrade(db) {
        const notes = db.createObjectStore("notes", { keyPath: "id" });
        notes.createIndex("createdAt", "createdAt");
        notes.createIndex("date", "date");
        notes.createIndex("isDeleted", "isDeleted");

        const tasks = db.createObjectStore("tasks", { keyPath: "id" });
        tasks.createIndex("createdAt", "createdAt");
        tasks.createIndex("date", "date");
        tasks.createIndex("isDeleted", "isDeleted");
      },
    });
  }
  return dbPromise;
}
