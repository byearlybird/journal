import { useCallback } from "react";
import { store, type Task, type NewTask } from "@app/store";
import { compareDesc, isToday, parseISO } from "date-fns";
import { createStoreSelector } from "@app/utils/store-selectors";

export const useTasksToday = createStoreSelector("tasks", (): Task[] => {
  return store
    .getAll("tasks", { where: (task) => isToday(parseISO(task.createdAt)) })
    .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));
});

export const useIncompleteTasks = createStoreSelector("tasks", (): Task[] => {
  return store
    .getAll("tasks", { where: (task) => task.status === "incomplete" })
    .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));
});

export const useIncompletePastDueTasks = createStoreSelector("tasks", (): Task[] => {
  return store
    .getAll("tasks", {
      where: (task) => task.status === "incomplete" && !isToday(parseISO(task.createdAt)),
    })
    .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));
});

export function useCreateTask() {
  return useCallback((task: Pick<NewTask, "content">) => {
    store.add("tasks", task);
  }, []);
}

export function useUpdateTaskStatus() {
  return useCallback((id: string, status: Task["status"]) => {
    store.update("tasks", id, { status });
  }, []);
}
