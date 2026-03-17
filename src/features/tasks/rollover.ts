import { tasksRepo, type Task } from "@app/db";

export async function rolloverTask(
  taskId: string,
  targetDate: string,
): Promise<{ original: Task; rolled: Task }> {
  const task = await tasksRepo.findById(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  if (task.status !== "incomplete") {
    throw new Error("Only incomplete tasks can be rolled over");
  }

  if (task.date === targetDate) {
    return { original: task, rolled: task };
  }

  const deferred = await tasksRepo.update(task.id, { status: "deferred" });
  if (!deferred) {
    throw new Error("Failed to defer task");
  }

  const rolled = await tasksRepo.create({
    content: deferred.content,
    scope: deferred.scope,
    date: targetDate,
    status: "incomplete",
    // presence of original_id indicates the original task was rolled over before, so keep it's original id
    original_id: task.original_id ?? deferred.id,
  });

  return { original: deferred, rolled };
}
