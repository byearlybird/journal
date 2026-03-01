import { tasksRepo, type Task, type NewTask } from "@/db";
import { useSyncContext } from "@/features/sync";
import { invalidateData } from "@/stores/data-version";

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
