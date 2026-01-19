import type { Task } from "@app/store";
import { CheckIcon } from "@phosphor-icons/react";

type TaskListProps = {
  tasks: Task[];
  onStatusChange: (id: string, status: Task["status"]) => void;
};

export function TaskList({ tasks, onStatusChange }: TaskListProps) {
  return (
    <div className="flex flex-col gap-2 divide-y divide-dashed divide-white/10">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
}

type TaskItemProps = {
  task: Task;
  onStatusChange: (id: string, status: Task["status"]) => void;
};

function TaskItem({ task, onStatusChange }: TaskItemProps) {
  const isComplete = task.status === "complete";

  const toggleComplete = () => {
    onStatusChange(task.id, isComplete ? "incomplete" : "complete");
  };

  return (
    <div className="flex gap-3 py-2">
      <button
        type="button"
        onClick={toggleComplete}
        className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border border-white/30 transition-all hover:border-white/50"
      >
        {isComplete && <CheckIcon className="size-3" weight="bold" />}
      </button>
      <p className={isComplete ? "text-white/50 line-through" : ""}>{task.content}</p>
    </div>
  );
}
