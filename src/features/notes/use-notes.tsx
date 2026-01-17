import type { NewNote } from "@app/store/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NotesService } from "./notes-service";

export function useNotesGroupedByDate() {
  return useQuery({
    queryKey: ["notes", "grouped-by-date"],
    queryFn: () => NotesService.getAllGroupedByDate(),
  });
}

export function useNotesToday() {
  return useQuery({
    queryKey: ["notes", "today"],
    queryFn: () => NotesService.getToday(),
  });
}

export function useCreateNote() {
  return useMutation({
    mutationFn: (note: Pick<NewNote, "content">) => NotesService.create(note),
  });
}
