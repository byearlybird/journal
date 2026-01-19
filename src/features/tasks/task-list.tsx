import { Checkbox, Field, Label } from "@headlessui/react";
import type { Task } from "@app/store";
import { CheckIcon } from "@phosphor-icons/react";
import { cx } from "cva";

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
        <TaskItem key={task.id} task={task} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
}

function TaskItem({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: string, status: Task["status"]) => void;
}) {
  const isComplete = task.status === "complete";

  const handleChange = (checked: boolean) => {
    onStatusChange(task.id, checked ? "complete" : "incomplete");
  };

  return (
    <Field className="flex gap-3 py-2 items-center">
      <Checkbox
        checked={isComplete}
        onChange={handleChange}
        className="group flex size-5 shrink-0 items-center justify-center rounded-full border border-white/30 transition-all hover:border-white/50 data-checked:border-white/50"
      >
        {isComplete && <CheckIcon className="size-3" weight="bold" />}
      </Checkbox>
      <Label className={cx(isComplete ? "text-white/50 line-through" : "text-white/90")}>
        {task.content}
      </Label>
    </Field>
  );
}
