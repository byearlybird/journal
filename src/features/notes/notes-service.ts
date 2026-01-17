import { store, type NewNote, type Note } from "@app/store/store";
import { compareDesc, format, isToday, parseISO } from "date-fns";

export const NotesService = {
  getAllGroupedByDate: () => {
    const notes = store
      .getAll("notes")
      .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));

    const grouped: Record<string, Note[]> = {};

    for (const note of notes) {
      const noteDate = parseISO(note.createdAt);
      const date = format(noteDate, "yyyy-MM-dd");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(note);
    }

    return grouped;
  },
  getToday: () => {
    return store
      .getAll("notes", {
        where: (note) => isToday(parseISO(note.createdAt)),
      })
      .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));
  },
  create: (note: NewNote) => {
    store.add("notes", note);
    return Promise.resolve();
  },
};
