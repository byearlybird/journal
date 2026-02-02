import { notesRepo, type NewNote } from "@app/db";
import { useMutation } from "@tanstack/react-query";

export function useCreateNote() {
  return useMutation({
    mutationFn: async (note: Pick<NewNote, "content">) => {
      return await notesRepo.create({
        content: note.content,
        scope: "daily",
        category: "log",
      });
    },
  });
}
