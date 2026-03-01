import { tasksRepo, type Task, type NewTask } from "@/app/idb";
import { useSyncContext } from "@/app/features/sync";
import { invalidateData } from "@/app/stores/data-version";

export function useCreateTask() {
  const { sync } = useSyncContext();

  return async (task: Pick<NewTask, "content">) => {
    await tasksRepo.create({
      content: task.content,
      scope: "daily",
    });
    invalidateData();
    sync();
  };
}

export function useUpdateTaskStatus() {
  const { sync } = useSyncContext();

  return async ({ id, status }: { id: string; status: Task["status"] }) => {
    await tasksRepo.update(id, { status });
    invalidateData();
    sync();
  };
}

export function useUpdateTask() {
  const { sync } = useSyncContext();

  return async (id: string, { content }: { content: string }) => {
    await tasksRepo.update(id, { content });
    invalidateData();
    sync();
  };
}
