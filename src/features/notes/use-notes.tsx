import { useCallback } from "react";
import { store, type Note, type NewNote } from "@app/store";
import { compareDesc, format, isToday, parseISO } from "date-fns";
import { createStoreSelector } from "@app/utils/store-selectors";

export const useNotesGroupedByDate = createStoreSelector("notes", (): Record<string, Note[]> => {
  const notes = store
    .getAll("notes")
    .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));

  const grouped: Record<string, Note[]> = {};
  for (const note of notes) {
    const date = format(parseISO(note.createdAt), "yyyy-MM-dd");
    grouped[date] ??= [];
    grouped[date].push(note);
  }
  return grouped;
});

export const useNotesToday = createStoreSelector("notes", (): Note[] => {
  return store
    .getAll("notes", { where: (note) => isToday(parseISO(note.createdAt)) })
    .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));
});

export function useCreateNote() {
  return useCallback((note: Pick<NewNote, "content">) => {
    store.add("notes", note);
  }, []);
}
