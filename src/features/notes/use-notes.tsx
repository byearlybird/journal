import { notesRepo, type NewNote } from "@app/db";
import { useRouter } from "@tanstack/react-router";

export function useCreateNote() {
  const router = useRouter();

  return async (note: Pick<NewNote, "content">) => {
    await notesRepo.create({
      content: note.content,
    });
    await router.invalidate();
  };
}

export function useUpdateNote() {
  const router = useRouter();

  return async (id: string, { content }: { content: string }) => {
    await notesRepo.update(id, { content });
    await router.invalidate();
  };
}

export function useRemoveNote() {
  const router = useRouter();

  return async (id: string) => {
    await notesRepo.remove(id);
    await router.invalidate();
  };
}
