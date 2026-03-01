import { notesRepo, type NewNote } from "@app/db";
import { useSyncContext } from "@app/features/sync";
import { invalidateData } from "@app/stores/data-version";

export function useCreateNote() {
  const { sync } = useSyncContext();

  return async (note: Pick<NewNote, "content">) => {
    await notesRepo.create({
      content: note.content,
      scope: "daily",
      category: "log",
    });
    invalidateData();
    sync();
  };
}

export function useUpdateNote() {
  const { sync } = useSyncContext();

  return async (id: string, { content }: { content: string }) => {
    await notesRepo.update(id, { content });
    invalidateData();
    sync();
  };
}
