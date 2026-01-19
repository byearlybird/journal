import type { Task } from "@app/store";
import { TaskCheckbox } from "./task-checkbox";

export function TaskList({
  tasks,
  onStatusChange,
}: {
  tasks: Task[];
  onStatusChange: (id: string, status: Task["status"]) => void;
}) {
  return (
    <div className="flex flex-col gap-2 divide-y divide-dashed divide-white/10">
      {tasks.map((task) => (
        <div key={task.id} className="py-2">
          <TaskCheckbox task={task} onStatusChange={onStatusChange} />
        </div>
      ))}
    </div>
  );
}
