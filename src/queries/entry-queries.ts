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

export const searchEntriesQueryOptions = (query: string) =>
  queryOptions({
    queryKey: ["entries", "search", query],
    queryFn: () => entryService.search(query),
    enabled: query.length > 0,
  });
