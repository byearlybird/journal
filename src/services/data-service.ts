import { db } from "@/db/client";

type ExportNote = {
  content: string;
  created_at: string;
  label: string | null;
};

type ExportTask = {
  content: string;
  created_at: string;
  status: "incomplete" | "complete" | "cancelled" | "deferred";
  label: string | null;
};

type ExportIntention = {
  content: string;
  month: string;
};

export type ExportFile = {
  exportedAt: string;
  notes: ExportNote[];
  tasks: ExportTask[];
  intentions: ExportIntention[];
};

export const dataService = {
  async buildExport(): Promise<ExportFile> {
    const [notes, tasks, intentions] = await Promise.all([
      db
        .selectFrom("notes")
        .leftJoin("labels", "labels.id", "notes.label")
        .select(["notes.content", "notes.created_at", "labels.name as label"])
        .execute(),
      db
        .selectFrom("tasks")
        .leftJoin("labels", "labels.id", "tasks.label")
        .select(["tasks.content", "tasks.created_at", "tasks.status", "labels.name as label"])
        .execute(),
      db.selectFrom("intentions").select(["content", "month"]).execute(),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      notes,
      tasks,
      intentions,
    };
  },
};
