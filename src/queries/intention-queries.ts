import { intentionService } from "@/app";
import { queryOptions } from "@tanstack/react-query";

export const intentionQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["entries", "intentions", id],
    queryFn: () => intentionService.get(id),
  });

export const intentionByMonthQueryOptions = (month: string) =>
  queryOptions({
    queryKey: ["entries", "intentions", "byMonth", month],
    queryFn: () => intentionService.getByMonth(month),
  });
