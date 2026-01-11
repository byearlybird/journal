import type { NewNote } from "@app/db/db";
import { NotesService } from "@app/services";
import { useMutation, useQuery } from "@tanstack/react-query";

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
		mutationFn: (note: NewNote) => NotesService.create(note),
	});
}
