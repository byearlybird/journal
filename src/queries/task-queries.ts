import { taskService } from "@/app";
import type { Task } from "@/models";
import { queryOptions } from "@tanstack/react-query";

export const taskQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["entries", "tasks", id],
    queryFn: () => taskService.get(id),
  });

export const tasksByStatusQueryOptions = (status: Task["status"]) =>
  queryOptions({
    queryKey: ["entries", "tasks", "byStatus", status],
    queryFn: () => taskService.getByStatus(status),
  });

export const rolledTaskQueryOptions = (originId: string) =>
  queryOptions({
    queryKey: ["entries", "tasks", "rolled", originId],
    queryFn: () => taskService.getFirstByOriginalId(originId),
  });
