import { Checkbox, Field, Label } from "@headlessui/react";
import type { Task } from "@/app/idb";
import { CheckIcon } from "@phosphor-icons/react";

export function TaskItem({
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
    <Field className="flex gap-3 items-center">
      <Checkbox
        checked={isComplete}
        onChange={handleChange}
        className="group flex size-5 shrink-0 items-center justify-center rounded-full border border-cloud-dark transition-all hover:border-cloud-light data-checked:border-cloud-light"
      >
        {isComplete && <CheckIcon className="size-3" weight="bold" />}
      </Checkbox>
      <Label className={isComplete ? "text-cloud-medium line-through" : "text-ivory-light"}>
        {task.content}
      </Label>
    </Field>
  );
}
