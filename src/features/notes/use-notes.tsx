import { notesRepo, type Note, type NewNote } from "@app/db";
import { useMutation, useQuery } from "@tanstack/react-query";
import { compareDesc, format, isToday, parseISO } from "date-fns";

const NOTES_QUERY_KEY = ["notes"];

export function useNotesGroupedByDate() {
  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: async (): Promise<Record<string, Note[]>> => {
      const notes = await notesRepo.findAll();
      const sorted = notes.sort((a, b) =>
        compareDesc(parseISO(a.created_at), parseISO(b.created_at)),
      );

      const grouped: Record<string, Note[]> = {};
      for (const note of sorted) {
        const date = format(parseISO(note.created_at), "yyyy-MM-dd");
        grouped[date] ??= [];
        grouped[date].push(note);
      }
      return grouped;
    },
  });
}

export function useNotesToday() {
  return useQuery({
    queryKey: [...NOTES_QUERY_KEY, "today"],
    queryFn: async (): Promise<Note[]> => {
      const notes = await notesRepo.findAll();
      return notes
        .filter((note) => isToday(parseISO(note.created_at)))
        .sort((a, b) => compareDesc(parseISO(a.created_at), parseISO(b.created_at)));
    },
  });
}

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
