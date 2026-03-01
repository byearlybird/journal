import { getDb } from "./client";
import { type Note, type Task, type NewNote, type NewTask, noteSchema, taskSchema } from "./schema";

export const notesRepo = {
  async findAll(): Promise<Note[]> {
    const db = await getDb();
    const all = await db.getAllFromIndex("notes", "isDeleted", 0);
    return all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  },

  async findById(id: string): Promise<Note | undefined> {
    const db = await getDb();
    const note = await db.get("notes", id);
    if (!note || note.isDeleted === 1) return undefined;
    return note;
  },

  async create(note: NewNote): Promise<Note> {
    const db = await getDb();
    const parsed: Note = noteSchema.parse(note);
    await db.put("notes", parsed);
    return parsed;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    const db = await getDb();
    const existing = await db.get("notes", id);
    if (!existing || existing.isDeleted === 1) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await db.put("notes", updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    const existing = await db.get("notes", id);
    if (!existing) return;
    await db.put("notes", { ...existing, isDeleted: 1, updatedAt: new Date().toISOString() });
  },
};

export const tasksRepo = {
  async findAll(): Promise<Task[]> {
    const db = await getDb();
    const all = await db.getAllFromIndex("tasks", "isDeleted", 0);
    return all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  },

  async findById(id: string): Promise<Task | undefined> {
    const db = await getDb();
    const task = await db.get("tasks", id);
    if (!task || task.isDeleted === 1) return undefined;
    return task;
  },

  async create(task: NewTask): Promise<Task> {
    const db = await getDb();
    const parsed: Task = taskSchema.parse(task);
    await db.put("tasks", parsed);
    return parsed;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const db = await getDb();
    const existing = await db.get("tasks", id);
    if (!existing || existing.isDeleted === 1) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await db.put("tasks", updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    const existing = await db.get("tasks", id);
    if (!existing) return;
    await db.put("tasks", { ...existing, isDeleted: 1, updatedAt: new Date().toISOString() });
  },
};
