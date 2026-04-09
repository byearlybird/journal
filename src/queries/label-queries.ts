import { labelService } from "@/app";
import { queryOptions } from "@tanstack/react-query";

export const allLabelsQueryOptions = () =>
  queryOptions({
    queryKey: ["labels"],
    queryFn: () => labelService.getAll(),
  });
