import { sql } from "./client";
import { type Note, type Task, type NewNote, type NewTask, noteSchema, taskSchema } from "./schema";

// Notes repository
export const notesRepo = {
  async findAll(): Promise<Note[]> {
    return (await sql`
      SELECT * FROM notes WHERE is_deleted = 0 ORDER BY created_at DESC
    `) as Note[];
  },

  async findById(id: string): Promise<Note | undefined> {
    const rows = await sql`
      SELECT * FROM notes WHERE id = ${id} AND is_deleted = 0 LIMIT 1
    `;
    return rows[0] as Note | undefined;
  },

  async create(note: NewNote): Promise<Note> {
    const insert: Note = noteSchema.parse(note);
    await sql`
      INSERT INTO notes (id, content, created_at, updated_at, date, scope, category, is_deleted)
      VALUES (${insert.id}, ${insert.content}, ${insert.created_at}, ${insert.updated_at}, ${insert.date}, ${insert.scope}, ${insert.category}, ${insert.is_deleted})
    `;
    return insert;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;
    const merged: Note = { ...existing, ...updates, updated_at: new Date().toISOString() };
    await sql`
      INSERT OR REPLACE INTO notes (id, content, created_at, updated_at, date, scope, category, is_deleted)
      VALUES (${merged.id}, ${merged.content}, ${merged.created_at}, ${merged.updated_at}, ${merged.date}, ${merged.scope}, ${merged.category}, ${merged.is_deleted})
    `;
    return merged;
  },

  async delete(id: string): Promise<void> {
    await sql`
      UPDATE notes SET is_deleted = 1, updated_at = ${new Date().toISOString()} WHERE id = ${id}
    `;
  },
};

// Tasks repository
export const tasksRepo = {
  async findAll(): Promise<Task[]> {
    return (await sql`
      SELECT * FROM tasks WHERE is_deleted = 0 ORDER BY created_at DESC
    `) as Task[];
  },

  async findById(id: string): Promise<Task | undefined> {
    const rows = await sql`
      SELECT * FROM tasks WHERE id = ${id} AND is_deleted = 0 LIMIT 1
    `;
    return rows[0] as Task | undefined;
  },

  async create(task: NewTask): Promise<Task> {
    const insert: Task = taskSchema.parse(task);
    await sql`
      INSERT INTO tasks (id, content, created_at, updated_at, date, scope, status, is_deleted)
      VALUES (${insert.id}, ${insert.content}, ${insert.created_at}, ${insert.updated_at}, ${insert.date}, ${insert.scope}, ${insert.status}, ${insert.is_deleted})
    `;
    return insert;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;
    const merged: Task = { ...existing, ...updates, updated_at: new Date().toISOString() };
    await sql`
      INSERT OR REPLACE INTO tasks (id, content, created_at, updated_at, date, scope, status, is_deleted)
      VALUES (${merged.id}, ${merged.content}, ${merged.created_at}, ${merged.updated_at}, ${merged.date}, ${merged.scope}, ${merged.status}, ${merged.is_deleted})
    `;
    return merged;
  },

  async delete(id: string): Promise<void> {
    await sql`
      UPDATE tasks SET is_deleted = 1, updated_at = ${new Date().toISOString()} WHERE id = ${id}
    `;
  },
};
