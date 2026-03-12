import { storage } from ".";
import { type Note, type Task, type NewNote, type NewTask, noteSchema, taskSchema } from "./schema";

const NOTE_PREFIX = "note:";
const TASK_PREFIX = "task:";

export const notesRepo = {
  async findAll(): Promise<Note[]> {
    return storage.valuesWithKeyPrefix<Note>(NOTE_PREFIX);
  },

  async findById(id: string): Promise<Note | undefined> {
    return storage.get<Note>(`${NOTE_PREFIX}${id}`);
  },

  async create(note: NewNote): Promise<Note> {
    const newNote = noteSchema.parse(note);
    await storage.set(`${NOTE_PREFIX}${newNote.id}`, newNote);
    return newNote;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    const note = await storage.get<Note>(`${NOTE_PREFIX}${id}`);
    if (!note) return undefined;
    const updatedNote = noteSchema.parse({ ...note, ...updates });
    await storage.set(`${NOTE_PREFIX}${id}`, updatedNote);
    return updatedNote;
  },

  async delete(_id: string): Promise<void> {},
};

export const tasksRepo = {
  async findAll(): Promise<Task[]> {
    return storage.valuesWithKeyPrefix<Task>(TASK_PREFIX);
  },

  async findById(id: string): Promise<Task | undefined> {
    return storage.get<Task>(`${TASK_PREFIX}${id}`);
  },

  async create(task: NewTask): Promise<Task> {
    const newTask = taskSchema.parse(task);
    await storage.set(`${TASK_PREFIX}${newTask.id}`, newTask);
    return newTask;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = await storage.get<Task>(`${TASK_PREFIX}${id}`);
    if (!task) return undefined;
    const updatedTask = taskSchema.parse({ ...task, ...updates });
    await storage.set(`${TASK_PREFIX}${id}`, updatedTask);
    return updatedTask;
  },

  async delete(_id: string): Promise<void> {},
};
