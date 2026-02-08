import { dbService } from "./service";
import { type Note, type Task, type NewNote, type NewTask, noteSchema, taskSchema } from "./schema";

// Notes repository
export const notesRepo = {
  async findAll(): Promise<Note[]> {
    return dbService.select<Note>(
      "SELECT * FROM notes WHERE is_deleted = $1 ORDER BY created_at DESC",
      [0],
    );
  },

  async findById(id: string): Promise<Note | undefined> {
    const rows = await dbService.select<Note>(
      "SELECT * FROM notes WHERE id = $1 AND is_deleted = $2",
      [id, 0],
    );
    return rows[0];
  },

  async create(note: NewNote): Promise<Note> {
    const insert: Note = noteSchema.parse(note);
    await dbService.execute(
      "INSERT INTO notes (id, content, created_at, updated_at, date, scope, category, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        insert.id,
        insert.content,
        insert.created_at,
        insert.updated_at,
        insert.date,
        insert.scope,
        insert.category,
        insert.is_deleted,
      ],
    );
    return insert;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    const current = await this.findById(id);
    if (!current) return undefined;

    const validated = noteSchema.parse({
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    });
    await dbService.execute(
      "UPDATE notes SET content = $1, date = $2, scope = $3, category = $4, is_deleted = $5, updated_at = $6 WHERE id = $7",
      [
        validated.content,
        validated.date,
        validated.scope,
        validated.category,
        validated.is_deleted,
        validated.updated_at,
        id,
      ],
    );
    return validated;
  },

  async delete(id: string): Promise<void> {
    await dbService.execute("UPDATE notes SET is_deleted = $1, updated_at = $2 WHERE id = $3", [
      1,
      new Date().toISOString(),
      id,
    ]);
  },
};

// Tasks repository
export const tasksRepo = {
  async findAll(): Promise<Task[]> {
    return dbService.select<Task>(
      "SELECT * FROM tasks WHERE is_deleted = $1 ORDER BY created_at DESC",
      [0],
    );
  },

  async findById(id: string): Promise<Task | undefined> {
    const rows = await dbService.select<Task>(
      "SELECT * FROM tasks WHERE id = $1 AND is_deleted = $2",
      [id, 0],
    );
    return rows[0];
  },

  async create(task: NewTask): Promise<Task> {
    const insert: Task = taskSchema.parse(task);
    await dbService.execute(
      "INSERT INTO tasks (id, content, created_at, updated_at, date, scope, status, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        insert.id,
        insert.content,
        insert.created_at,
        insert.updated_at,
        insert.date,
        insert.scope,
        insert.status,
        insert.is_deleted,
      ],
    );
    return insert;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const current = await this.findById(id);
    if (!current) return undefined;

    const validated = taskSchema.parse({
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    });
    await dbService.execute(
      "UPDATE tasks SET content = $1, date = $2, scope = $3, status = $4, is_deleted = $5, updated_at = $6 WHERE id = $7",
      [
        validated.content,
        validated.date,
        validated.scope,
        validated.status,
        validated.is_deleted,
        validated.updated_at,
        id,
      ],
    );
    return validated;
  },

  async delete(id: string): Promise<void> {
    await dbService.execute("UPDATE tasks SET is_deleted = $1, updated_at = $2 WHERE id = $3", [
      1,
      new Date().toISOString(),
      id,
    ]);
  },
};
