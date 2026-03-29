import { noteService } from "@/app";
import { queryOptions } from "@tanstack/react-query";

export const noteQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["entries", "notes", id],
    queryFn: () => noteService.get(id),
  });

export const pinnedNotesQueryOptions = () =>
  queryOptions({
    queryKey: ["entries", "notes", "pinned"],
    queryFn: () => noteService.getPinned(),
  });
