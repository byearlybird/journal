import {
  NumberOneIcon,
  NumberTwoIcon,
  NumberThreeIcon,
  NumberFourIcon,
  NumberFiveIcon,
  NumberSixIcon,
  NumberSevenIcon,
  NumberEightIcon,
  NumberNineIcon,
  PencilSimpleLineIcon,
  PushPinIcon,
} from "@phosphor-icons/react";
import { useIncompleteTasks } from "@app/features/tasks";

type ActionNavbarProps = {
  onCreateClick: () => void;
  onPushpinClick: () => void;
};

const NumberIcons = [
  NumberOneIcon,
  NumberTwoIcon,
  NumberThreeIcon,
  NumberFourIcon,
  NumberFiveIcon,
  NumberSixIcon,
  NumberSevenIcon,
  NumberEightIcon,
  NumberNineIcon,
];

export function ActionNavbar({ onCreateClick, onPushpinClick }: ActionNavbarProps) {
  const incompleteTasks = useIncompleteTasks();
  const taskCount = incompleteTasks.length;
  const displayCount = Math.min(taskCount, 9);
  const NumberIcon = taskCount > 0 && taskCount <= 9 ? NumberIcons[displayCount - 1] : null;

  return (
    <div className="fixed right-[max(var(--safe-right),0.5rem)] bottom-[max(var(--safe-bottom),0.5rem)] flex gap-2">
      <button
        type="button"
        onClick={onPushpinClick}
        className="flex h-12 min-w-12 px-2 gap-2 items-center justify-center rounded-lg border bg-black/80 text-white backdrop-blur transition-transform duration-100 ease-in-out active:scale-95 box-border "
      >
        <PushPinIcon className="size-4" />
        {taskCount === 0 ? null : taskCount > 9 ? (
          <span className="text-sm">9+</span>
        ) : (
          NumberIcon && <NumberIcon />
        )}
      </button>
      <button
        type="button"
        onClick={onCreateClick}
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow text-black transition-transform duration-100 ease-in-out active:scale-95 box-border"
      >
        <PencilSimpleLineIcon className="size-4" />
      </button>
    </div>
  );
}
