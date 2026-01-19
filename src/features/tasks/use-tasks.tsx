import { useSyncExternalStore, useCallback } from "react";
import { store, type Task, type NewTask } from "@app/store";
import { compareDesc, isToday, parseISO } from "date-fns";

// Track store version for memoization
let storeVersion = 0;
store.onChange(() => {
  storeVersion++;
});

const subscribe = (callback: () => void) => store.onChange(callback);

// Memoize getSnapshot results to avoid infinite loops
function createMemoizedSelector<T>(selector: () => T) {
  let cachedVersion = storeVersion;
  let cachedResult = selector();

  return () => {
    if (storeVersion !== cachedVersion) {
      cachedVersion = storeVersion;
      cachedResult = selector();
    }
    return cachedResult;
  };
}

const getTasksToday = createMemoizedSelector((): Task[] => {
  return store
    .getAll("tasks", { where: (task) => isToday(parseISO(task.createdAt)) })
    .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));
});

const getIncompleteTasks = createMemoizedSelector((): Task[] => {
  return store
    .getAll("tasks", { where: (task) => task.status === "incomplete" })
    .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));
});

export function useTasksToday() {
  return useSyncExternalStore(subscribe, getTasksToday);
}

export function useIncompleteTasks() {
  return useSyncExternalStore(subscribe, getIncompleteTasks);
}

export function useCreateTask() {
  const createTask = useCallback((task: Pick<NewTask, "content">) => {
    store.add("tasks", task);
  }, []);

  return { mutate: createTask };
}

export function useUpdateTaskStatus() {
  const updateTaskStatus = useCallback((id: string, status: Task["status"]) => {
    store.update("tasks", id, { status });
  }, []);

  return { mutate: updateTaskStatus };
}
