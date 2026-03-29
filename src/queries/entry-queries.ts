import { entryService } from "@/app";
import { queryOptions } from "@tanstack/react-query";

export const todayEntriesQueryOptions = () =>
  queryOptions({
    queryKey: ["entries", "today"],
    queryFn: () => entryService.getToday(),
  });

export const groupedEntriesQueryOptions = () =>
  queryOptions({
    queryKey: ["entries", "grouped"],
    queryFn: () => entryService.getGroupedByDate(),
  });
