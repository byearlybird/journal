import { tasksRepo, type Task, type NewTask } from "@app/db";
import { useSyncContext } from "@app/features/sync";
import { useRouter } from "@tanstack/react-router";

export function useCreateTask() {
  const router = useRouter();
  const { sync } = useSyncContext();

  return async (task: Pick<NewTask, "content">) => {
    await tasksRepo.create({
      content: task.content,
      scope: "daily",
    });
    await router.invalidate();
    sync();
  };
}

export function useUpdateTaskStatus() {
  const router = useRouter();
  const { sync } = useSyncContext();

  return async ({ id, status }: { id: string; status: Task["status"] }) => {
    await tasksRepo.update(id, { status });
    await router.invalidate();
    sync();
  };
}

export function useUpdateTask() {
  const router = useRouter();
  const { sync } = useSyncContext();

  return async (id: string, { content }: { content: string }) => {
    await tasksRepo.update(id, { content });
    await router.invalidate();
    sync();
  };
}
