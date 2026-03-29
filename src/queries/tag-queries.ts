import { tagService } from "@/app";
import { queryOptions } from "@tanstack/react-query";

export const allTagsQueryOptions = () =>
  queryOptions({
    queryKey: ["tags"],
    queryFn: () => tagService.getAll(),
  });
