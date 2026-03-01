import { notesRepo, type NewNote } from "@app/db";
import { useSyncContext } from "@app/features/sync";
import { useRouter } from "@tanstack/react-router";

export function useCreateNote() {
  const router = useRouter();
  const { sync } = useSyncContext();

  return async (note: Pick<NewNote, "content">) => {
    await notesRepo.create({
      content: note.content,
      scope: "daily",
      category: "log",
    });
    await router.invalidate();
    sync();
  };
}

export function useUpdateNote() {
  const router = useRouter();
  const { sync } = useSyncContext();

  return async (id: string, { content }: { content: string }) => {
    await notesRepo.update(id, { content });
    await router.invalidate();
    sync();
  };
}
